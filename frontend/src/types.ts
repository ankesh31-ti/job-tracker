export type Status = "Applied" | "Interview" | "Rejected" | "Offer" | "No Response";

export type Channel =
  | "Career Page"
  | "Email"
  | "LinkedIn"
  | "Referral"
  | "Job Portal"
  | "Other";

export interface Application {
  id: number;
  company: string;
  date_applied: string;
  cv_version: string | null;
  cv_link: string | null;
  jd_text: string | null;
  jd_link: string | null;
  channel: string | null;
  status: Status;
  notes: string | null;
  created_at: string;
}

export type ApplicationInput = Omit<Application, "id" | "created_at">;
