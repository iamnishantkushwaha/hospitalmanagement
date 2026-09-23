import { HeartPulse } from "lucide-react";
import { HOSPITAL_NAME } from "@/lib/constants";
import { RegisterForm } from "@/components/layout/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-2 text-slate-900">
            <HeartPulse className="h-7 w-7 text-blue-700" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">{HOSPITAL_NAME}</h1>
          <p className="text-sm text-slate-500">Patient self-registration</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
