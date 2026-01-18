import { PropsWithChildren } from "react";

const SubCard = ({ children }: PropsWithChildren) => {
  return <div className="bg-card rounded-lg border p-4">{children}</div>;
};

const SubCardHeader = ({ children }: PropsWithChildren) => {
  return <div className="text-foreground mb-2 font-medium">{children}</div>;
};

const SubCardContent = ({ children }: PropsWithChildren) => {
  return <div className="gap-2 flex flex-wrap">{children}</div>;
};
export { SubCard, SubCardHeader, SubCardContent };
