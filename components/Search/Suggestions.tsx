type SuggestionProps = {
  suggestions: { id: string; display: string }[];
  pickSuggestion: (s: { id: string; display: string }) => void;
};

export default function Suggestions({
  suggestions,
  pickSuggestion,
}: SuggestionProps) {
  console.log("Suggestions passed to component: ", suggestions);
  return (
    <ul className="border rounded mt-2 max-h-56 overflow-auto">
      {suggestions.map((s) => (
        <li
          key={s.id}
          className="p-2 hover:bg-slate-100 cursor-pointer"
          onClick={() => pickSuggestion(s)}
        >
          {s.display}
        </li>
      ))}
    </ul>
  );
}
