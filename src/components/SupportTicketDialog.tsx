import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const SUPPORT_ENDPOINT = ""; // TODO: provided separately
const SUPPORT_SECRET_HEADER_KEY = ""; // TODO: provided separately
const SUPPORT_SECRET_VALUE = ""; // TODO: provided separately
const CLIENT_ID = "twentytwentysolutions";

export function SupportTicketButton() {
  const [open, setOpen] = useState(false);
  const { profile, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    description: "",
  });

  const resetForm = () => {
    setForm({ name: "", email: "", subject: "", category: "", description: "" });
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setForm({
        name: profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() : "",
        email: user?.email ?? "",
        subject: "",
        category: "",
        description: "",
      });
      setError(null);
    } else {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(SUPPORT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(SUPPORT_SECRET_HEADER_KEY ? { [SUPPORT_SECRET_HEADER_KEY]: SUPPORT_SECRET_VALUE } : {}),
        },
        body: JSON.stringify({ ...form, client_id: CLIENT_ID }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      toast.success("Your ticket has been submitted. Our team will get back to you as soon as possible.");
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Support ticket submit error:", err);
      setError(
        "Something went wrong. Please try again or contact us directly via email at support@twentytwentysolutions.io."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => handleOpenChange(true)}>
        <LifeBuoy className="h-4 w-4" />
        Support
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact support</DialogTitle>
            <DialogDescription>
              Send us a ticket and our team will get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="support-name">Name</Label>
              <Input
                id="support-name"
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">E-mail</Label>
              <Input
                id="support-email"
                type="email"
                required
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                required
                maxLength={200}
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-category">Category</Label>
              <Select
                required
                value={form.category}
                onValueChange={(value) => setForm((f) => ({ ...f, category: value }))}
              >
                <SelectTrigger id="support-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
                  <SelectItem value="Feature Request">Feature Request</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-description">Description</Label>
              <Textarea
                id="support-description"
                required
                rows={4}
                maxLength={5000}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send ticket"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
