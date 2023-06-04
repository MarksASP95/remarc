"use client";

import { useEffect, useState } from "react";
import "./entities.page.scss";
import { Entity } from '@/models/entity.model';
import { useEntities } from "../../hooks/entities.hook";
import Link from "next/link";
import { useAuth } from "../../hooks/auth.hooks";
import RemarcSpinner from "@/app/components/RemarcSpinner/RemarcSpinner.component";

export default function EntitiesPage() {

  const { getEntities } = useEntities();

  const [ entities, setEntities ] = useState<Entity[] | null | undefined>();

  useEffect(() => {
    getEntities()
      .then((entities) => {
        setEntities(entities);
      });
  }, []);

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
          </div>
        </Link>
      );
    })
  }

  return (
    <section className="entities-page">
      <h1>Entities</h1>
      <br />
      
      { !entities && <RemarcSpinner /> }
      <div className="entities-grid">
        {getEntitiesEls()}
      </div>
    </section>
  );
}