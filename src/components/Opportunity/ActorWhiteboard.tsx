import React, { FC, useRef, useEffect, useState } from 'react';
import Excalidraw, { serializeAsJSON } from '@excalidraw/excalidraw';
import { createStyles } from '../../hooks/useTheme';
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types';
import { NewWhiteboardActorModal } from './NewWhiteboardActorModal';
import Button from '../core/Button';
import { useApolloErrorHandler } from '../../hooks';
import { Actor, EcosystemModel, Maybe } from '../../models/graphql-schema';
import { useUpdateActorMutation, useUpdateEcosystemModelMutation } from '../../hooks/generated/graphql';

interface ActorWhiteboardProps {
  actors: Actor[];
  ecosystemModel: Maybe<EcosystemModel>;
}

const useActorWhiteboardStyles = createStyles(_theme => ({
  container: {
    height: 600,
    excalidrawWrapper: true,
  },
}));

const ActorWhiteboard: FC<ActorWhiteboardProps> = ({ actors = [], ecosystemModel }) => {
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

  const [updateEcosystemModelMutation] = useUpdateEcosystemModelMutation({
    onError: handleError,
  });

  const onChange = async (elements, appstate) => {
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

    saveToBackend(elements, appstate);
  };

  const saveToBackend = (elements, appState) => {
    if (ecosystemModel && elements.length > 0) {
      const canvasValue = serializeAsJSON(elements, appState);
      const newecosystemModel = JSON.stringify({ value: canvasValue, identifierMap: identifierMap });
      console.log('New ecosystem model', newecosystemModel);
      updateEcosystemModelMutation({
        variables: {
          ecosystemModelData: {
            ID: ecosystemModel.id,
            canvas: {
              value: newecosystemModel,
            },
          },
        },
      });
    }
  };
  const UIOptions = {
    canvasActions: {
      export: {
        onExportToBackend: saveToBackend,
      },
    },
  };

  console.log('Initial ecosystemModel', ecosystemModel);
  const initialData = ecosystemModel ? JSON.parse(JSON.parse(ecosystemModel.canvas?.value || '{}').value) : {};
  console.log('initial ecosystemModel data', initialData);
  console.log('initial ecosystemModel data', typeof initialData);
  return (
    <div className={styles.container}>
      <Button variant="primary" onClick={showNewActorModalF} text="New Actor"></Button>
      <Excalidraw
        ref={excalidrawRef}
        initialData={initialData}
        onChange={onChange}
        onCollabButtonClick={() => window.alert('You clicked on collab button')}
        UIOptions={UIOptions}
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
