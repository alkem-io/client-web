import React, { FC, useRef, useEffect, useState } from 'react';
import Excalidraw from '@excalidraw/excalidraw';
import { createStyles } from '../../hooks/useTheme';
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types';
import { NewWhiteboardActorModal } from './NewWhiteboardActorModal';
import Button from '../core/Button';
import { Actor } from '../../models/graphql-schema';

interface ActorWhiteboardProps {
  actors: Actor[];
}

const useActorWhiteboardStyles = createStyles(_theme => ({
  container: {
    height: 600,
    excalidrawWrapper: true,
  },
}));

const ActorWhiteboard: FC<ActorWhiteboardProps> = ({ actors = [] }) => {
  const excalidrawRef = useRef<ExcalidrawAPIRefValue>(null);
  const styles = useActorWhiteboardStyles();
  const [offsetHeight, setOffsetHeight] = useState(0);
  const [showNewActorModal, setShowNewActorModal] = useState(false);
  const [identifierMap, setIdentifierMap] = useState(new Map());
  const updateIdentifierMap = (k, v) => {
    setIdentifierMap(new Map(identifierMap.set(k, v)));
  };

  const hideNewActorModal = () => {
    setShowNewActorModal(false);
  };
  const showNewActorModalF = _e => {
    setShowNewActorModal(true);
  };

  useEffect(() => {
    const onScroll = async e => {
      setOffsetHeight(e.target.offsetHeight);
      const excalidraw = await excalidrawRef.current?.readyPromise;
      if (excalidraw) {
        excalidraw.refresh();
      }
    };
    window.addEventListener('scroll', onScroll, true);
  }, [offsetHeight]);

  const actorIds = actors.map(actor => actor.id);

  const addElements = async elements => {
    const excalidraw = await excalidrawRef.current?.readyPromise;
    elements
      .filter(element => element.type === 'text')
      .filter(element => actorIds.includes(element.text))
      .forEach(element => {
        updateIdentifierMap(element.id, element.text);
        element.text = actors.filter(actor => actor.id === element.text).map(actor => actor.name)[0];
      });
    excalidraw?.updateScene({ elements });
  };

  return (
    <div className={styles.container}>
      <Button onClick={showNewActorModalF}>New Actor</Button>
      <Excalidraw
        ref={excalidrawRef}
        onChange={(elements, state) => console.log('Elements :', elements, 'State : ', state)}
        onCollabButtonClick={() => window.alert('You clicked on collab button')}
      />

      <NewWhiteboardActorModal
        show={showNewActorModal}
        onHide={hideNewActorModal}
        actors={actors}
        onSubmit={addElements}
      ></NewWhiteboardActorModal>
    </div>
  );
};

export { ActorWhiteboard };
