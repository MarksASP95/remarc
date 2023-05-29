"use client";

import "./EntityPanel.scss"
import { Entity, EntityAction, EntityActionCreate, EntityActionEventCreate } from "@/models/entity.model";
import { RemarcModal } from "@/app/components/RemarcModal/RemarcModal";
import { useRef, useState } from "react";
import { useForm } from "@felte/react";
import { TimeUnit } from "@/models/general.model";
import { minutesToNormalizedUnit, normalizedUnitToMinutes } from "@/app/utils/time-operations";
import { useEntities } from '../../../hooks/entities.hook';

export interface EntityFormProps {
  entity: Entity;
  actions: EntityAction[];
}

const timeUnitsDict
  : { [key in TimeUnit]: string }
  = {
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    months: "Months",
    weeks: "Weeks",
  };

const timeUnitsOptions = Object.entries(timeUnitsDict).map(([ key, value ]) => {
  return <option key={key} value={key}>{value}</option>;
});

export default function EntityPanel({ entity, actions }: EntityFormProps) {

  let modalTitle: string = "";
  const [ selectedAction, setSelectedAction ] 
    = useState<EntityAction | null | undefined>(undefined);

  const [ writingToDB, setWritingToDB ] = useState<boolean>(false);

    
  const selectedActionRef = useRef<EntityAction | null | undefined>(undefined);
  selectedActionRef.current = selectedAction;

  if (!!selectedAction) modalTitle = `Edit "${selectedAction.name}"`;
  if (selectedAction === null) modalTitle = "Create action";

  const handleActionClick = (action: EntityAction) => {
    const { 
      value: intervalValue, 
      unit: intervalUnit 
    } = minutesToNormalizedUnit(action.timeIntervalMinutes);
    setFields("action_name", action.name);
    setFields("action_desc", action.description);
    setFields("action_remind_every_value", intervalValue);
    setFields("action_remind_every_unit", intervalUnit);
    setSelectedAction(action);
  }

  const handleAddActionClick = () => {
    reset();
    setSelectedAction(null);
  }

  const renderEntityActions = (actions: EntityAction[]) => {
    if (!actions.length) return <p>No actions</p>;
  
    return actions.map((action) => {

      const { 
        value: timeValue, 
        unit: timeUnit 
      } = minutesToNormalizedUnit(action.timeIntervalMinutes);

      return (
        <div onClick={() => handleActionClick(action)} key={action.id} className="entity-actions__item">
          <p className="entity-actions__item__title">{action.name}</p>
          <small className="entity-actions__item__remind">Remind every {timeValue} {timeUnitsDict[timeUnit]} </small>
        </div>
      );
    });
  }

  const { createEntityAction, updateEntityAction } = useEntities();

  const clearSelectedAction = setSelectedAction.bind(undefined, undefined);

  const handleCreate = (actionCr: EntityActionCreate) => {
    return createEntityAction(actionCr)
      .then((action) => {
        console.log("Success!")
        actions.push(action);
        clearSelectedAction();
      })
      .catch((err) => console.log("Err creating", err))
  }
  const handleUpdate = (partialAction: Partial<EntityActionCreate>) => {
    return updateEntityAction(selectedActionRef.current!.id, partialAction)
      .then(() => {
        let actionIndex = actions.findIndex((a) => a.id === selectedActionRef.current!.id);
        if (actionIndex === -1) return;
        actions[actionIndex] = {
          ...actions[actionIndex],
          ...partialAction,
        };

        console.log("Success");
        clearSelectedAction();
      })
      .catch((err) => console.log("Err updating", err))
  }

  const handleSubmit = (values: any) => {
    if (writingToDB) return;

    const { 
      action_remind_every_value, 
      action_remind_every_unit 
    } = values;

    const timeIntervalMinutes: number = normalizedUnitToMinutes({ 
      value: action_remind_every_value, 
      unit: action_remind_every_unit 
    });

    setWritingToDB(true);
    let writingPromise: Promise<any>;
    if (!!selectedActionRef.current) {
      const actionUpdateData: Partial<EntityActionCreate> = {
        description: values.action_desc,
        name: values.action_name,
        timeIntervalMinutes,
      }
      writingPromise = handleUpdate(actionUpdateData)
    } else {
      const actionCr: EntityActionCreate = {
        description: values.action_desc,
        name: values.action_name,
        timeIntervalMinutes,
        entityId: entity.id,
        startsAt: new Date(),
      };

      writingPromise = handleCreate(actionCr);
    }

    writingPromise.finally(() => setWritingToDB(false));
  }

  const { form: actionForm, setFields, reset, data } = useForm({
    onSubmit: handleSubmit,
  });

  return (
    <div className="entity-page">
      <h1>
        {entity.name}
      </h1>
      <br />

      <div className="row">
          <h2 style={{ marginRight: 10 }}>
            Actions
          </h2>
          <button onClick={handleAddActionClick} className="button button-outline">
            Add
          </button>
      </div>
      <div className="entity-actions">
        {renderEntityActions(actions)}
      </div>

      <RemarcModal 
        visible={selectedAction !== undefined} 
        title={modalTitle} 
        onBrackdropClick={() => { setSelectedAction(undefined) }}
      >
        <form ref={actionForm}>
          <label htmlFor="action_name">Name</label>
          <input disabled={writingToDB} type="text" placeholder="Name" name="action_name" />
          
          <label htmlFor="action_desc">Description</label>
          <textarea disabled={writingToDB} placeholder="Description" name="action_desc" ></textarea>

          <label htmlFor="action_remind_every_value">Remind me every</label>
          <div className="row">
            <div className="column">
              <input disabled={writingToDB} type="number" placeholder="Value" name="action_remind_every_value" />
            </div>
            <div className="column">
              <select name="action_remind_every_unit">
                {timeUnitsOptions}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="column"></div>
            <div className="column">
              <button disabled={writingToDB} className="button" style={{ width: "100%" }}>
                { selectedAction ? "Update" : "Create" }
              </button>
            </div>
            <div className="column"></div>
          </div>
        </form>
      </RemarcModal>
    </div>
  );  
}


