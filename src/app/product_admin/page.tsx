import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import ProductAdminClient from "./ProductAdminClient";

export const metadata: Metadata = {
  title: "OzymorLab Product Admin | Referral Control Center",
  description: "Private OzymorLab product administration console for referral programs, access controls, onboarding activity, and school operations.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ProductAdminPage() {
  return (
    <AuthProvider>
      <ProductAdminClient />
    </AuthProvider>
  );
}
