import { StepLayout } from "./StepLayout.js";

type WelcomeStepProps = {
  onNext: () => void;
};

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <StepLayout
      eyebrow="Lets get started"
      title="Welcome to WorldNote"
      actionLabel="Next"
      onAction={onNext}
    />
  );
}
