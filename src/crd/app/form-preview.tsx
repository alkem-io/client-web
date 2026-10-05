import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import '@/crd/styles/crd.css';
import { CalloutFormResponseDialog } from '@/crd/components/callout/CalloutFormResponseDialog';
import { CalloutFormBox } from '@/crd/components/callout/CalloutFormBox';
import { CalloutFormFillIn } from '@/crd/components/callout/CalloutFormFillIn';
import crdCommonEN from '@/crd/i18n/common/common.en.json';
import crdSpaceEN from '@/crd/i18n/space/space.en.json';

i18n.use(initReactI18next).init({
  resources: { en: { 'crd-space': crdSpaceEN, 'crd-common': crdCommonEN } },
  lng: 'en',
  ns: ['crd-space', 'crd-common'],
  defaultNS: 'crd-common',
  interpolation: { escapeValue: false },
});

const questions = [
  { id: 'q1', prompt: 'Which area should we prioritise next quarter?', type: 'SINGLE_CHOICE' as const, required: false,
    options: [
      { id: 'o1', label: 'Roof survey backlog' },
      { id: 'o2', label: 'Grid connection studies' },
      { id: 'o3', label: 'Community outreach' },
      { id: 'o4', label: 'Financing models' },
    ] },
  { id: 'q2', prompt: 'What is currently blocking you?', explanation: 'Anything from missing data to a decision nobody has made yet.', type: 'LONG_TEXT' as const, required: false, options: [] },
  { id: 'q3', prompt: 'Who else should we be talking to?', type: 'SHORT_TEXT' as const, required: false, options: [] },
  ...(location.search.includes('extra') ? [{ id: 'q4', prompt: 'Which formats suit you?', type: 'MULTIPLE_CHOICE' as const, required: true,
    options: [{ id: 'm1', label: 'Workshops' }, { id: 'm2', label: 'Office hours' }, { id: 'm3', label: 'Newsletter' }] }] : []),
];

const response = {
  id: 'r1', createdDate: new Date('2026-10-01T09:30:00Z'), respondent: { id: 'u1', name: 'Ada Lovelace' },
  answers: [
    { questionID: 'q1', prompt: questions[0].prompt, type: 'SINGLE_CHOICE' as const, selectedLabels: ['Roof survey backlog'] },
    { questionID: 'q2', prompt: questions[1].prompt, type: 'LONG_TEXT' as const, text: 'We are still waiting for the grid operator data.\nAnd nobody has decided on the financing round.', selectedLabels: [] },
    { questionID: 'q4', prompt: 'Which formats suit you?', type: 'MULTIPLE_CHOICE' as const, selectedLabels: ['Workshops', 'Newsletter'] },
    { questionID: 'qx', prompt: 'An old question', type: 'SHORT_TEXT' as const, text: 'Old answer', selectedLabels: [] },
  ],
};
const columns = [...questions.map(q => ({ questionID: q.id, prompt: q.prompt, removed: false })), { questionID: 'qx', prompt: 'An old question', removed: true }];

createRoot(document.getElementById('root')!).render(
  location.search.includes('response') ? (
    <div className="crd-root"><CalloutFormResponseDialog open={true} onOpenChange={() => {}} response={response} formTitle="Q4 Planning — Tell Us Where to Focus" columns={columns} canModerate={true} onDelete={() => {}} deletedUserLabel="Deleted user" /></div>
  ) :
  <div className="crd-root min-h-screen bg-background p-8">
    <div id="callout" className="mx-auto w-[768px] rounded-xl border border-border bg-card p-6">
      <CalloutFormBox title="Q4 Planning — Tell Us Where to Focus" questionCount={questions.length} visibility="ADMINS" spaceName="Q4 Space" defaultCollapsed={location.search.includes('collapsed')}>
        <CalloutFormFillIn questions={questions} state="OPEN" published={true} canSubmit={true} submitting={false} onSubmit={() => {}} />
      </CalloutFormBox>
    </div>
  </div>
);
