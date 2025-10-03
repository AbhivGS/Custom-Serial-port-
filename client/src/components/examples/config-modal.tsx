import { useState } from "react";
import ConfigModal from "../config-modal";
import { Button } from "@/components/ui/button";

export default function ConfigModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Config Modal</Button>
      <ConfigModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
