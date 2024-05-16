import React, { useState } from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import { Trans } from 'react-i18next';
import DashboardBanner from '../../../../core/ui/content/DashboardBanner';
import PlansTableDialog from '../../../../domain/licence/planstable/PlansTableDialog';
import { Plan } from '../../../../domain/licence/planstable/Plan';

const StartingSpace = () => {
  const [plansDialogOpen, setPlansDialogOpen] = useState(false);
  const onSelectPlan = (plan: Plan) => {
    // TODO: Handle plan selection
    console.log(`SELECTED PLAN ${plan}`);
    setPlansDialogOpen(false);
  };

  return (
    <>
      <DashboardBanner onClick={() => setPlansDialogOpen(true)} to="">
        <Trans
          i18nKey="pages.home.sections.startingSpace.title"
          components={{
            big: <BlockTitle />,
            small: <Caption />,
          }}
        />
      </DashboardBanner>
      <PlansTableDialog open={plansDialogOpen} onClose={() => setPlansDialogOpen(false)} onSelectPlan={onSelectPlan} />
    </>
  );
};

export default StartingSpace;
