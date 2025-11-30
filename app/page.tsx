import { Button } from "@/components/ui/button";
import { ArrowUpRightIcon } from "lucide-react";

export default function Page() {
  return (

    // BUTTONS - SHADCN
    <div className="flex gap-4 p-10">
      <Button variant="outline">Outline Button</Button>
      <Button variant="default">Default Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="destructive">Destructive Button</Button>
      <Button variant="link">Link Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpRightIcon />
      </Button>
    </div>
  );
}
