import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TaskEntity } from './task.entity';
import { InjectConnection } from '@nestjs/typeorm';
import { CacheManager } from '../shared/cache/cacheManager';

@Injectable()
@EventSubscriber()
export class EverythingSubscriber implements EntitySubscriberInterface<TaskEntity> {

  constructor(
    @InjectConnection() readonly connection: Connection,
    private cacheManager: CacheManager) {
    connection.subscribers.push(this);
  }

  afterInsert(event: InsertEvent<TaskEntity>) {
    console.log(`BEFORE ENTITY INSERTED: `, event.metadata.name);

    switch (event.metadata.name) {

      case 'TaskEntity' :
        this.cacheManager.cleanTasksCache();
        break;
      default:
       //
    }

  };

  beforeInsert(event: InsertEvent<any>) {

    console.log(`BEFORE ENTITY INSERTED: `, event.entity);
  }

  beforeUpdate(event: UpdateEvent<any>) {

    console.log(`BEFORE ENTITY UPDATED: `, event.entity);
  }
}
