type ToggleButtonProps = {
  enabled: boolean;
  onToggle: () => void;
};

export default function ToggleButton({ enabled, onToggle }: ToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-[60px] h-[35px] p-[5px] items-center rounded-full transition-colors duration-300 cursor-pointer
        ${enabled ? "bg-axis" : "bg-text2"}`}
    >
      <div
        className={`w-[25px] h-[25px] bg-white rounded-full transition-transform duration-300 ease-in-out
          ${enabled ? "translate-x-[25px]" : "translate-x-0"}`}
      />
    </button>
  );
}
