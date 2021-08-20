import { nanoid } from 'nanoid';
import { Form, Formik } from 'formik';
import React, { FC } from 'react';
import Divider from '../core/Divider';
import Button from '../core/Button';
import { Actor } from '../../models/graphql-schema';
import { FormikSelect } from '../../components/Admin/Common/FormikSelect';
import { DialogContent, DialogTitle } from '../core/dialog';
import { Dialog } from '@material-ui/core';

const template = {
  type: 'excalidraw',
  version: 2,
  source: 'http://localhost:3000',
  elements: [
    {
      type: 'ellipse',
      version: 141,
      versionNonce: 399471804,
      isDeleted: false,
      id: 'x2wSSqqmK7qMPq0mogUal',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 707.6234384219906,
      y: 155.33271313719456,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      width: 56.5443115234375,
      height: 43.849609375,
      seed: 1153880068,
      groupIds: ['JMsDys8KUtJsx8mxtu8hh'],
      strokeSharpness: 'round',
      boundElementIds: [],
    },
    {
      type: 'line',
      version: 189,
      versionNonce: 647775492,
      isDeleted: false,
      id: 'bk4euljqBU1R1HcKzHnMw',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 736.1549325626156,
      y: 200.9915876489133,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      width: 3.477539958432317,
      height: 130.4052668013237,
      seed: 1808867900,
      groupIds: ['JMsDys8KUtJsx8mxtu8hh'],
      strokeSharpness: 'round',
      boundElementIds: [],
      startBinding: null,
      endBinding: null,
      lastCommittedPoint: null,
      startArrowhead: null,
      endArrowhead: null,
      points: [
        [0, 0],
        [3.477539958432317, 130.4052668013237],
      ],
    },
    {
      type: 'line',
      version: 220,
      versionNonce: 1408859452,
      isDeleted: false,
      id: 'XHdxICWNYkF741pueBVUo',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 675.343289810717,
      y: 226.92394550070173,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      width: 126.71344479262825,
      height: 1.9752637267113187,
      seed: 1324756868,
      groupIds: ['JMsDys8KUtJsx8mxtu8hh'],
      strokeSharpness: 'round',
      boundElementIds: [],
      startBinding: null,
      endBinding: null,
      lastCommittedPoint: null,
      startArrowhead: null,
      endArrowhead: null,
      points: [
        [0, 0],
        [126.71344479262825, -1.9752637267113187],
      ],
    },
    {
      type: 'line',
      version: 201,
      versionNonce: 542442628,
      isDeleted: false,
      id: 'azfhy0FcF9ecywPcnbSoZ',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 686.6983730045522,
      y: 378.9339494604617,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      width: 51.124467272907395,
      height: 47.56125829592338,
      seed: 1718188732,
      groupIds: ['JMsDys8KUtJsx8mxtu8hh'],
      strokeSharpness: 'round',
      boundElementIds: [],
      startBinding: null,
      endBinding: null,
      lastCommittedPoint: null,
      startArrowhead: null,
      endArrowhead: null,
      points: [
        [0, 0],
        [51.124467272907395, -47.56125829592338],
      ],
    },
    {
      type: 'line',
      version: 225,
      versionNonce: 2127459772,
      isDeleted: false,
      id: 'gj8MFWEXOdgPXfOMu_0pu',
      fillStyle: 'solid',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      angle: 0,
      x: 740.9138436954281,
      y: 330.7303571801633,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      width: 46.7197265625,
      height: 43.883056640625,
      seed: 722312964,
      groupIds: ['JMsDys8KUtJsx8mxtu8hh'],
      strokeSharpness: 'round',
      boundElementIds: [],
      startBinding: null,
      endBinding: null,
      lastCommittedPoint: null,
      startArrowhead: null,
      endArrowhead: null,
      points: [
        [0, 0],
        [46.7197265625, 43.883056640625],
      ],
    },
    {
      id: '_NwWDKFNDGsu2L34LS3GA',
      type: 'text',
      x: 684.7000122070312,
      y: 122.63333129882812,
      width: 250,
      height: 26,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      fillStyle: 'hachure',
      strokeWidth: 1,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      groupIds: ['JMsDys8KUtJsx8mxtu8hh'],
      strokeSharpness: 'sharp',
      seed: 1942606852,
      version: 90,
      versionNonce: 203132348,
      isDeleted: false,
      boundElementIds: null,
      text: 'Actor Name',
      fontSize: 20,
      fontFamily: 1,
      textAlign: 'left',
      verticalAlign: 'top',
      baseline: 18,
    },
  ],
  appState: {
    gridSize: null,
    viewBackgroundColor: '#ffffff',
  },
};

const createActor = reference => {
  console.log('Creating actor with reference', reference);
  const elements = [...template.elements];

  const groupId = nanoid();

  elements.forEach(element => {
    element.id = nanoid();
    element.groupIds = [groupId];
  });
  elements.filter(element => element.type === 'text').forEach(element => (element.text = reference));

  return elements;
};

interface NewWhiteboardActorModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (elements: any[]) => void;
  actors: Actor[];
}

interface NewWhiteboardActorParameters {
  actor: string;
}

const NewWhiteboardActorModal: FC<NewWhiteboardActorModalProps> = ({ show, onHide, actors = [], onSubmit }) => {
  const initialValues: NewWhiteboardActorParameters = {
    actor: actors[0] ? actors[0].id : '',
  };

  const onSubmitAction = async values => {
    console.log('Values in onsubmit', values);
    // Call whiteboard callback
    onSubmit(createActor(values.actor));
    onHide();
  };

  return (
    <Dialog open={show}>
      <DialogTitle id="add-actor-whiteboard" onClose={onHide}>
        New Whiteboard
      </DialogTitle>
      <DialogContent>
        <Formik initialValues={initialValues} onSubmit={onSubmitAction} enableReinitialize validator={() => ({})}>
          {({ isSubmitting, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <label htmlFor="actor">Acctor: </label>
              <FormikSelect title="Actor" name="actor" values={actors}></FormikSelect>
              <Divider />
              <Button variant="primary" type="submit" disabled={isSubmitting} text="Add Actor"></Button>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export { NewWhiteboardActorModal };
