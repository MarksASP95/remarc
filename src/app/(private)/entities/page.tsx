"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./entities.page.scss";
import { Entity, EntityCreate } from '@/models/entity.model';
import { useEntities } from "../../hooks/entities.hook";
import Link from "next/link";
import { useAuth } from "../../hooks/auth.hooks";
import RemarcSpinner from "@/app/components/RemarcSpinner/RemarcSpinner.component";
import { RemarcModal } from "@/app/components/RemarcModal/RemarcModal";
import { useForm } from "@felte/react";
import TrashSVG from "../../assets/svgs/trash.svg";
import EditSVG from "../../assets/svgs/edit.svg";
import Image from "next/image";
import { DivMouseEvent } from "@/models/event.model";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";

type EntityAction = "edit" | "delete" | "create";
interface EntityManagementConfig {
  action: EntityAction;
  entity: Entity | null;
}

export default function EntitiesPage() {

  const { getEntities, createEntity, updateEntity } = useEntities();

  const [ entities, setEntities ] = useState<Entity[] | null | undefined>();
  const [ actionFormErrorsMap, setActionFormErrorsMap ] = useState<any>({});
  const [ writingToDB, setWritingToDB ] = useState<boolean>(false);
  const [ _, _rerender ] = useState<any>();

  const rerender = () => _rerender({});

  const entityManagementConfigRef = useRef<EntityManagementConfig | null>(null);
  const setEntityManagementConfig = (value: EntityManagementConfig | null) => {
    entityManagementConfigRef.current = value;
    rerender();
  }

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = () => {
    setEntities(undefined);
    getEntities()
      .then((entities) => {
        setEntities(entities);
      });
  }

  const handleEditEntityClick = (entity: Entity) => {
    setEntityManagementConfig({ entity, action: "edit" });
  }

  const handleDeleteEntityClick = (entity: Entity) => {
    setEntityManagementConfig({ entity, action: "delete" });
  }

  const handleEntityOptionClick = (e: DivMouseEvent, entity: Entity, action: EntityAction) => {
    e.stopPropagation();
    e.preventDefault();
    switch(action) {
      case "delete": {
        handleDeleteEntityClick(entity);
        break;
      }
      case "edit": {
        handleEditEntityClick(entity);
        setFields("entity_name", entity.name);
        setFields("entity_desc", entity.description);
        break;
      }
    }
  }

  const closeEntityModal = () => {
    setEntityManagementConfig(null);
    setActionFormErrorsMap({});
    reset();
  }

  const getEntitiesEls = () => {
    if (entities === undefined) return null;
    if (!entities) return null;

    return entities.map((entity) => {
      return (
        <Link href={`/entities/${entity.id}`} key={entity.id}>
          <div className="entity-card">
            <h3 className="entity-card__title">
              { entity.name }
            </h3>

            <div className="entity-options">
              <div onClick={(e) => handleEntityOptionClick(e, entity, "delete")} className="entity-options__item">
                <Image 
                  src={TrashSVG}
                  alt={`Edit entity ${entity.name}`}
                />
              </div>
              <div onClick={(e) => handleEntityOptionClick(e, entity, "edit")} className="entity-options__item">
                <Image 
                  src={EditSVG}
                  alt={`Remove entity ${entity.name}`}
                />
              </div>
            </div>
          </div>
        </Link>
      );
    })
  }

  const handleAddEntityClick = () => {
    setEntityManagementConfig({
      entity: null,
      action: "create",
    });
  }

  const handleSubmit = (values: any) => {
    if (writingToDB) return;
   
    const EntityForm = z.object({
      entity_name: z.string().min(4, { message: "At least 4 characters" }),
      entity_desc: z.string().min(4, { message: "At least 4 characters" }),
    });

    const formCheck = EntityForm.safeParse(values);

    if (!formCheck.success) {
      setActionFormErrorsMap(formCheck.error.format());
      console.log("Error", formCheck.error.format())
      return; 
    }

    setWritingToDB(true);
    const entityCr: EntityCreate = {
      description: values.entity_desc,
      name: values.entity_name,
    };
    
    if (entityManagementConfigRef.current!.action === "create") {
      createEntity(entityCr)
        .then(() => {
          toast.success("Entity created");
          fetchEntities();
          closeEntityModal();
        })
        .catch((e) => {
          toast.error("Error creating. Try again");
          console.log("Error creating", e);
        })
        .finally(() => {
          setWritingToDB(false);
        });
    }
    if (entityManagementConfigRef.current!.action === "edit") {
      updateEntity(entityManagementConfigRef.current!.entity!.id, entityCr)
        .then(() => {
          toast.success("Entity updated");
          fetchEntities();
          closeEntityModal();
        })
        .catch((e) => {
          toast.error("Error updating. Try again");
          console.log("Error updating", e);
        })
        .finally(() => {
          setWritingToDB(false);
        });
    }
  };

  const { form: entityForm, setFields, reset, data } = useForm({
    onSubmit: handleSubmit,
  });

  const getErrorMessages = (fieldName: string): JSX.Element[] => {
    return (actionFormErrorsMap[fieldName]?._errors || []).map((errorText: string, i: number) => {
      return <p key={i} style={{ color: "red" }}>* {errorText}</p>
    })
  }

  const modalText = useMemo(() => {
    if (!entityManagementConfigRef.current) return "";
    const { action, entity } = entityManagementConfigRef.current;

    if (action !== "create" && !entity) throw "No entity was provided";

    if (action === "create") return "New entity";
    if (action === "edit") return `Edit ${entity!.name}`
    if (action === "delete") return `Remove ${entity!.name}`
  }, [entityManagementConfigRef.current]);

  const showModal = (() => {
    if (!entityManagementConfigRef.current) return false;
    if (entityManagementConfigRef.current.action === "create") return true;
    if (entityManagementConfigRef.current.action === "edit") return true;

    return false;
  })();

  const deleteEntity = (entityId: number) => {
    updateEntity(entityId, { isDeleted: true })
    .then(() => {
      toast.success("Entity deleted");
      fetchEntities();
      closeEntityModal();
    })
    .catch((e) => {
      toast.error("Error deleting. Try again");
      console.log("Error deleting", e);
    })
    .finally(() => {
      setWritingToDB(false);
    });
  };

  return (
    <>
      <section className="entities-page">
        <h1>Entities</h1>
        <br />

        
        {entities && 
          <button onClick={handleAddEntityClick} className="button button-outline">
            Add
          </button>
        }
        
        { !entities && <RemarcSpinner /> }
        <div className="entities-grid">
          {getEntitiesEls()}
        </div>
      </section>

      <RemarcModal
        visible={entityManagementConfigRef.current?.action === "delete"}
        title={modalText}
        onBrackdropClick={closeEntityModal}
        acceptButtonConfig={{
          text: "Confirm",
          fn: () => deleteEntity(entityManagementConfigRef.current?.entity?.id!),
          loading: writingToDB,
          loadingText: "Deleting...",
        }}
        cancelButtonConfig={{
          text: "Cancel",
          fn: closeEntityModal,
          loading: writingToDB,
        }}
        size="medium"
        closable={!writingToDB}
      >
        <p style={{ textAlign: "center" }}>Are you sure you want to delete <b>{entityManagementConfigRef.current?.entity?.name}</b>?</p>
      </RemarcModal>

      <RemarcModal 
        visible={showModal} 
        title={modalText} 
        onBrackdropClick={closeEntityModal}
      >
          <form ref={entityForm}>
            <label htmlFor="entity_name">Name</label>
            <input disabled={writingToDB} type="text" placeholder="Name" name="entity_name" />
            {getErrorMessages("entity_name")}
            
            <label htmlFor="entity_desc">Description</label>
            <textarea disabled={writingToDB} placeholder="Description" name="entity_desc" ></textarea>
            {getErrorMessages("entity_desc")}

            <div className="row">
              <div className="column"></div>
              <div className="column">
                <button disabled={writingToDB} className="button" style={{ width: "100%" }}>
                  { entityManagementConfigRef.current?.action === 'edit' ? "Update" : "Create" }
                </button>
              </div>
              <div className="column"></div>
            </div>
          </form> 
      </RemarcModal>
      <Toaster />
    </>
  );
}