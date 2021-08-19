import React, { FC, useRef, useEffect, useState } from 'react';
import Excalidraw from '@excalidraw/excalidraw';
import { createStyles } from '../../hooks/useTheme';
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types';
import { NewWhiteboardActorModal } from './NewWhiteboardActorModal';
import Button from '../core/Button';
import { useApolloErrorHandler } from '../../hooks';
import { Actor } from '../../models/graphql-schema';
import { useUpdateActorMutation } from '../../hooks/generated/graphql';

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
        const actorName = actors.filter(actor => actor.id === element.text).map(actor => actor.name)[0];
        updateIdentifierMap(element.id, { actorId: element.text, originalText: actorName });
        element.text = actorName;
      });
    excalidraw?.updateScene({ elements });
  };

  const handleError = useApolloErrorHandler();
  const [updateActor] = useUpdateActorMutation({
    onError: handleError,
  });

  const onChange = async (elements, _state) => {
    const elementsThatNeedUpdating = elements.filter(element => {
      console.log('Filter', element.text, identifierMap.get(element.id)?.originalText);
      return identifierMap.has(element.id) && element.text !== identifierMap.get(element.id)?.originalText;
    });
    console.log('Elements that need updating', elementsThatNeedUpdating);
    console.log('IdentifierMap', identifierMap);
    elementsThatNeedUpdating.forEach(element => {
      const queryInput = {
        variables: {
          input: {
            ID: identifierMap.get(element.id).actorId,
            name: element.text,
          },
        },
      };
      console.log('QueryInput', queryInput);
      updateActor(queryInput);
      updateIdentifierMap(element.id, { actorId: identifierMap.get(element.id).actorId, originalText: element.text });
    });
  };

  return (
    <div className={styles.container}>
      <Button onClick={showNewActorModalF}>New Actor</Button>
      <Excalidraw
        ref={excalidrawRef}
        onChange={onChange}
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
