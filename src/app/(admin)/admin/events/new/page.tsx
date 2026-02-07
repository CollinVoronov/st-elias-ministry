import { NewEventForm } from "@/components/events/NewEventForm";

interface Props {
  searchParams: { title?: string; description?: string; ideaId?: string };
}

export default function NewEventPage({ searchParams }: Props) {
  return (
    <NewEventForm
      defaultTitle={searchParams.title}
      defaultDescription={searchParams.description}
      ideaId={searchParams.ideaId}
    />
  );
}
