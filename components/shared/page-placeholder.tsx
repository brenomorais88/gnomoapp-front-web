import { FeaturePagePlaceholder } from "@/components/shared/layout/feature-page-placeholder";

type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return <FeaturePagePlaceholder title={title} description={description} />;
}
