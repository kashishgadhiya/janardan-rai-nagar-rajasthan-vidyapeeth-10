import { CardDescription, CardTitle, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const SectionHeader = ({ icon, title, description }: SectionHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
};

export default SectionHeader;
