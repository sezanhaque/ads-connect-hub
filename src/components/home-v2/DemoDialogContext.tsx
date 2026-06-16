import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { posthog } from "@/lib/posthog";

type Ctx = { open: () => void };
const DemoDialogContext = createContext<Ctx>({ open: () => {} });

export const useDemoDialog = () => useContext(DemoDialogContext);

export function DemoDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://js-eu1.hsforms.net/forms/embed/147002455.js";
    s.defer = true;
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  const open = () => {
    posthog.capture("demo_requested");
    setIsOpen(true);
  };

  return (
    <DemoDialogContext.Provider value={{ open }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan een kennismaking</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>
    </DemoDialogContext.Provider>
  );
}
