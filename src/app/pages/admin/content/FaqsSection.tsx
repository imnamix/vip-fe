import FaqEditor from './FaqEditor';
import type { FaqItem } from './types';

interface Props { faqs: FaqItem[]; setFaqs: (f: FaqItem[]) => void }

export default function FaqsSection({ faqs, setFaqs }: Props) {
  return <FaqEditor items={faqs} setItems={setFaqs} />;
}
