import { useRouter } from 'next/router';
import EventContainer from './EventContainer';

type Props = {
  type?: 'event' | 'premier';
};
const EventPage = (props: Props) => {
  const { type } = props;
  const router = useRouter();
  const rawId = router.query.slug as string;
  const eventId = rawId?.split('-').pop() || '';

  return <EventContainer eventId={eventId} type={type} />;
};

export default EventPage;
