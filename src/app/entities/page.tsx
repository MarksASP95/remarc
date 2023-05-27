"use client";

import { useEffect, useState } from "react";
import "./entities.page.scss";
import { Entity } from '@/models/entity.model';
import { useEntities } from "../hooks/entities.hook";
import Link from "next/link";

export default function EntitiesPage() {

  const { getEntities } = useEntities();

  const [ entities, setEntities ] = useState<Entity[] | null | undefined>();

  useEffect(() => {
    getEntities()
      .then((entities) => {
        console.log(entities)
        setEntities(entities);
      });
  }, []);

  const getEntitiesEls = () => {
    if (entities === undefined) return "Loading..."
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
      
      <div className="entities-grid">
        {getEntitiesEls()}
      </div>
    </section>
  );
}