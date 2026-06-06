use std::fs;
use std::path::Path;

use image::imageops::FilterType;
use image::{DynamicImage, GenericImageView};

/// Longest edge for card cover images saved to the vault.
pub const COVER_MAX_EDGE_PX: u32 = 1200;
/// Longest edge for family crest images (small on-card display).
pub const CREST_MAX_EDGE_PX: u32 = 512;
/// Lossy WebP quality (0–100).
const WEBP_QUALITY: f32 = 85.0;

fn extension_lower(path: &Path) -> Option<String> {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_ascii_lowercase())
}

fn should_copy_without_optimization(ext: &str) -> bool {
    // Vector assets: preserve format (no rasterization here).
    // AVIF: decoding needs native libdav1d; copy through and let the webview render it.
    matches!(ext, "svg" | "avif")
}

fn resize_to_max_edge(image: DynamicImage, max_edge: u32) -> DynamicImage {
    let (width, height) = image.dimensions();
    let longest = width.max(height);
    if longest <= max_edge {
        return image;
    }

    let scale = max_edge as f32 / longest as f32;
    let new_width = ((width as f32 * scale).round() as u32).max(1);
    let new_height = ((height as f32 * scale).round() as u32).max(1);
    image.resize_exact(new_width, new_height, FilterType::Lanczos3)
}

fn encode_webp(image: &DynamicImage) -> Result<Vec<u8>, String> {
    let rgba = image.to_rgba8();
    let (width, height) = rgba.dimensions();
    let encoder = webp::Encoder::from_rgba(rgba.as_raw(), width, height);
    Ok(encoder.encode(WEBP_QUALITY).to_vec())
}

/// Resize (if needed) and encode as lossy WebP. Returns raw bytes.
pub fn optimize_raster_to_webp(source: &Path, max_edge: u32) -> Result<Vec<u8>, String> {
    let image = image::open(source).map_err(|error| error.to_string())?;
    let resized = resize_to_max_edge(image, max_edge);
    encode_webp(&resized)
}

/// Save an optimized WebP asset, or copy through vector formats unchanged.
pub fn write_optimized_card_asset(
    source: &Path,
    dest_dir: &Path,
    file_prefix: &str,
    max_edge: u32,
) -> Result<String, String> {
    if !source.is_file() {
        return Err("Image file does not exist".to_string());
    }

    fs::create_dir_all(dest_dir).map_err(|error| error.to_string())?;

    let ext = extension_lower(source).unwrap_or_else(|| "png".to_string());

    let filename = if should_copy_without_optimization(&ext) {
        let dest_name = format!("{file_prefix}{ext}");
        let dest = dest_dir.join(&dest_name);
        fs::copy(source, &dest).map_err(|error| error.to_string())?;
        dest_name
    } else {
        let dest_name = format!("{file_prefix}webp");
        let dest = dest_dir.join(&dest_name);
        let bytes = optimize_raster_to_webp(source, max_edge)?;
        fs::write(&dest, bytes).map_err(|error| error.to_string())?;
        dest_name
    };

    Ok(filename)
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::RgbaImage;

    #[test]
    fn resize_smaller_image_is_unchanged_dimensions() {
        let img =
            DynamicImage::ImageRgba8(RgbaImage::new(100, 50));
        let out = resize_to_max_edge(img, 1200);
        assert_eq!(out.dimensions(), (100, 50));
    }

    #[test]
    fn resize_scales_longest_edge() {
        let img =
            DynamicImage::ImageRgba8(RgbaImage::new(2000, 1000));
        let out = resize_to_max_edge(img, 1200);
        assert_eq!(out.dimensions(), (1200, 600));
    }

    #[test]
    fn avif_is_copied_without_optimization() {
        assert!(should_copy_without_optimization("avif"));
    }
}
