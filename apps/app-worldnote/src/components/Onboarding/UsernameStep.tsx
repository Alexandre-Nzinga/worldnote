import { Input } from "@heroui/react";
import { useState } from "react";
import { onboardingFieldClassNames } from "./fieldClassNames.js";
import { StepLayout } from "./StepLayout.js";

type UsernameStepProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export function UsernameStep({ value, onChange, onNext }: UsernameStepProps) {
  const [showError, setShowError] = useState(false);
  const trimmed = value.trim();
  const isInvalid = showError && trimmed.length === 0;

  const handleNext = () => {
    if (trimmed.length === 0) {
      setShowError(true);
      return;
    }
    onNext();
  };

  return (
    <StepLayout
      eyebrow="Welcome to WorldNote"
      title="What should we call you?"
      stepNumber={1}
      actionLabel="Next"
      onAction={handleNext}
    >
      <Input
        autoFocus
        label="Username"
        placeholder="Enter name here"
        value={value}
        onValueChange={(next) => {
          onChange(next);
          if (showError && next.trim().length > 0) {
            setShowError(false);
          }
        }}
        isInvalid={isInvalid}
        errorMessage={isInvalid ? "Username is required" : undefined}
        classNames={onboardingFieldClassNames}
      />
    </StepLayout>
  );
}
