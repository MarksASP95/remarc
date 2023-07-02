"use client";

import "./EntityPanel.scss"
import { Entity, EntityAction, EntityActionCreate } from "@/models/entity.model";
import { RemarcModal } from "@/app/components/RemarcModal/RemarcModal";
import { useRef, useState } from "react";
import { useForm } from "@felte/react";
import { TimeUnit } from "@/models/general.model";
import { dateToInputValue, minutesToNormalizedUnit, normalizedUnitToMinutes } from "@/app/utils/time-operations";
import { useEntities } from '../../../../hooks/entities.hook';
import Image from "next/image";
import TrashSVG from "../../../../assets/svgs/trash.svg";
import { DivMouseEvent } from "@/models/event.model";
import z from "zod";
import { toast, Toaster } from "react-hot-toast";

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

  const { createEntityAction, updateEntityAction, deleteAction } = useEntities();

  const [ selectedAction, setSelectedAction ] 
    = useState<EntityAction | null | undefined>(undefined);

  const [ actionToDelete, setActionToDelete ] = useState<EntityAction | null>(null);
  const [ deletingAction, setDeletingAction ] = useState<boolean>(false);

  const [ actionFormErrorsMap, setActionFormErrorsMap ] 
    = useState<any>({});

  const [ writingToDB, setWritingToDB ] = useState<boolean>(false);

    
  const selectedActionRef = useRef<EntityAction | null | undefined>(undefined);
  selectedActionRef.current = selectedAction;

  if (!!selectedAction) modalTitle = `Edit "${selectedAction.name}"`;
  if (selectedAction === null) modalTitle = "Create action";

  const closeActionDeleteModal = () => setActionToDelete(null);
  const handleActionDeleteClick = (e: DivMouseEvent, action: EntityAction) => {
    e.stopPropagation();
    setActionToDelete(action);
  }
  const confirmDeleteAction = async (actionId: number) => {
    setDeletingAction(true);
    try {
      await deleteAction(actionId);
      const actionIndex = actions.findIndex((a) => a.id === actionId);
      if (actionIndex !== -1) actions.splice(actionIndex, 1);
      toast.success("Action deleted");
      setActionToDelete(null);
    } catch (error) {
      console.log("Error deleting action", error);
    } finally {
      setDeletingAction(false);
    }
  }

  const handleActionClick = (action: EntityAction) => {
    const { 
      value: intervalValue, 
      unit: intervalUnit 
    } = minutesToNormalizedUnit(action.timeIntervalMinutes);
    setFields("action_name", action.name);
    setFields("action_desc", action.description);
    setFields("action_remind_every_value", intervalValue);
    setFields("action_remind_every_unit", intervalUnit);
    setFields("start_date_radio", "later");
    setFields("next_at", dateToInputValue(action.nextAt));
    setSelectedAction(action);
  }

  const handleAddActionClick = () => {
    reset();
    setFields("start_date_radio", "now");
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
          <div onClick={(e) => handleActionDeleteClick(e, action)} className="entity-actions__item__delete">
            <Image 
              src={TrashSVG}
              alt="Trash icon"
            />
          </div>
          <p className="entity-actions__item__title">{action.name}</p>
          <small className="entity-actions__item__remind">Remind every {timeValue} {timeUnitsDict[timeUnit]} </small>
        </div>
      );
    });
  }

  const clearSelectedAction = setSelectedAction.bind(undefined, undefined);

  const handleCreate = (actionCr: EntityActionCreate) => {
    return createEntityAction(actionCr)
      .then((action) => {
        actions.push(action);
        clearSelectedAction();
      });
  }
  const handleUpdate = (partialAction: Partial<EntityActionCreate>): Promise<any> => {
    return updateEntityAction(selectedActionRef.current!.id, partialAction)
      .then(() => {
        let actionIndex = actions.findIndex((a) => a.id === selectedActionRef.current!.id);
        if (actionIndex === -1) return;
        actions[actionIndex] = {
          ...actions[actionIndex],
          ...partialAction,
        };

        clearSelectedAction();
      });
  }

  const handleSubmit = (values: any) => {
    if (writingToDB) return;

    const ActionForm = z.object({
      action_name: z.string().min(4, { message: "At least 4 characters" }),
      action_desc: z.string().min(4, { message: "At least 4 characters" }),
      action_remind_every_value: z.number().min(1, { message: "Must be at least 1" }),
      action_remind_every_unit: z.string(),
      start_date_radio: z.enum(["now", "later"] as const),
      next_at: z.string(),
    });

    const formCheck = ActionForm.safeParse(values);

    if (formCheck.success) {
      
    } else {
      setActionFormErrorsMap(formCheck.error.format());
      console.log("Error", formCheck.error.format())
      return;
    }

    const { 
      action_remind_every_value, 
      action_remind_every_unit ,
      start_date_radio,
      next_at,
    } = values;

    const timeIntervalMinutes: number = normalizedUnitToMinutes({ 
      value: action_remind_every_value, 
      unit: action_remind_every_unit 
    });

    setWritingToDB(true);
    let writingPromise: Promise<any>;

    let nextAt: Date;
    if (start_date_radio === "now") {
      nextAt = new Date();
    } else {
      if (!next_at) return console.log("Enter a valid date");
      nextAt = new Date(next_at);
    }

    if (!!selectedActionRef.current) {
      const actionUpdateData: Partial<EntityActionCreate> = {
        description: values.action_desc,
        name: values.action_name,
        timeIntervalMinutes,
        nextAt,
      };
      writingPromise = handleUpdate(actionUpdateData)
        .then(() => toast.success("Action updated"));
    } else {
      const actionCr: EntityActionCreate = {
        description: values.action_desc,
        name: values.action_name,
        timeIntervalMinutes,
        entityId: entity.id,
        nextAt,
      };

      writingPromise = handleCreate(actionCr)
        .then(() => toast.success("Action created"));
    }

    writingPromise
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred")
      })
      .finally(() => setWritingToDB(false));
  }

  const { form: actionForm, setFields, reset, data } = useForm({
    onSubmit: handleSubmit,
  });

  const getErrorMessages = (fieldName: string): JSX.Element[] => {
    return (actionFormErrorsMap[fieldName]?._errors || []).map((errorText: string, i: number) => {
      return <p key={i} style={{ color: "red" }}>* {errorText}</p>
    })
  }

  return (
    <>
      <Toaster />
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
          onBrackdropClick={() => { setSelectedAction(undefined); setActionFormErrorsMap({}); }}
        >
          <form ref={actionForm}>
            <label htmlFor="action_name">Name</label>
            <input disabled={writingToDB} type="text" placeholder="Name" name="action_name" />
            {getErrorMessages("action_name")}
            
            <label htmlFor="action_desc">Description</label>
            <textarea disabled={writingToDB} placeholder="Description" name="action_desc" ></textarea>
            {getErrorMessages("action_desc")}

            <label htmlFor="action_remind_every_value">Remind me every</label>
            <div className="row">
              <div className="column">
                <input disabled={writingToDB} type="number" placeholder="Value" name="action_remind_every_value" />
                {getErrorMessages("action_remind_every_value")}
              </div>
              <div className="column">
                <select name="action_remind_every_unit">
                  {timeUnitsOptions}
                </select>
              </div>
            </div>

            <label htmlFor="start_date">Start date</label>
            <div className="row">
              <div className="column">
                <input type="radio" value="now" name="start_date_radio" /> Now
              </div>

              <div className="column">
                <input type="radio" value="later" name="start_date_radio" /> Another date
                <input disabled={data('start_date_radio') === "now"} type="date" name="next_at" />
                {getErrorMessages("next_at")}
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

        <RemarcModal
          visible={!!actionToDelete}
          acceptButtonConfig={{
            fn: () => confirmDeleteAction(actionToDelete!.id),
            loading: deletingAction,
          }}
          cancelButtonConfig={{
            fn: closeActionDeleteModal,
            loading: deletingAction,
          }}
        >
          <p>
            Are you sure of deleting "{actionToDelete?.name}"
          </p>
        </RemarcModal>
      </div>
    </>
  );  
}


