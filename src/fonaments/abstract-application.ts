import "reflect-metadata";
import express from "express";
import * as fs from 'fs';
import Query from "../database/Query";
import { RequestInputs } from "./http/request-inputs";
import { ServiceContainer } from "./services/service-container";
import { RouterService } from "./http/router/router.service";
import { RouterServiceProvider } from "./http/router/router.provider";
import { AuthorizationServiceProvider } from "./authorization/authorization.provider";
import { AuthorizationMiddleware } from "./authorization/authorization.middleware";

declare module 'express-serve-static-core' {
  interface Request {
    dbCon: Query,
    inputs: RequestInputs
  }
}

let _runningApplication: AbstractApplication = null;

export function app(): AbstractApplication {
  return _runningApplication;
}


export abstract class AbstractApplication {
  protected _express: express.Application;
  protected _config: any;
  protected _path: string;
  protected _services: ServiceContainer;

  private _providers: Array<any> = [
    RouterServiceProvider,
    AuthorizationServiceProvider
  ];

  private _premiddlewares: Array<any> = [
    AuthorizationMiddleware
  ];

  private _postmiddlewares: Array<any> = [

  ];
  
  constructor(path: string = process.cwd()) {
    try {
      this._path = path;
      console.log('Loading application from ' + this._path);
      this._express = express();
      this._config = require('../config/config');
      _runningApplication = this;
    } catch (e) {
      console.error('Aplication startup failed: ' + e.message);
      process.exit(e);
    }
  }

  get express(): express.Application {
    return this._express;
  }

  get config(): any {
    return this._config;
  }

  get path(): string {
    return this._path;
  }

  public getService(name: string): any {
    return this._services.get(name);
  }

  protected async bootstrap() {
    await this.generateDirectories();
    this.startServiceContainer();
    await this.registerProviders();
    await this.registerMiddlewares('before');
    this.registerRoutes();
    await this.registerMiddlewares('after');
  }

  protected async registerProviders(): Promise<void> {
    const providersArray: Array<any> = this._providers.concat(this.providers());
    
    for(let i = 0; i < providersArray.length; i++) {
      await (new providersArray[i]()).register(this._services);
    }
  }
  
  protected registerRoutes() {
    const routerService: RouterService = this.getService(RouterService.name);
    routerService.registerRoutes();
  };

  protected startServiceContainer() {
    this._services = new ServiceContainer(this);
  }

  /**
   * Register all middlewares
   */
  protected async registerMiddlewares(group: 'before' | 'after'): Promise<void> {
    let middlewares: Array<any> = [];

    if (group === 'before') {
      middlewares = this._premiddlewares.concat(this.beforeMiddlewares());
      for(let i = 0; i < middlewares.length; i++) {
        await (new middlewares[i]()).register(this);
      }
    }

    if (group === 'after') {
      middlewares = this.afterMiddlewares().concat(this._postmiddlewares);
      for(let i = 0; i < middlewares.length; i++) {
        await (new middlewares[i]()).register(this);
      }
    }
  }

  /**
   * Returns an array of Middleware classes to be registered before the routes handlers
   */
  protected beforeMiddlewares(): Array<any> {
    return [];
  }

  /**
   * Returns an array of Middleware classes to be registered after the routes handlers
   */
  protected afterMiddlewares(): Array<any> {
    return [];
  }

  /**
   * Returns an array of ServiceProviders classes to be bound
   */
  protected providers(): Array<any> {
    return [];
  }

  /**
   * Creates autogenerated directories
   */
  private async generateDirectories() {
    try {
      fs.mkdirSync('./logs');
    } catch (e) {
      if (e.code !== 'EEXIST') {
        console.error("Could not create the logs directory. ERROR: ", e);
        process.exit(1);
      }
    }

    /**
     * Create the data directories, just in case them aren't there.
     */
    try {
      fs.mkdirSync('./DATA');
      fs.mkdirSync(this._config.get('policy').data_dir);
      fs.mkdirSync(this._config.get('pki').data_dir);
    } catch (e) {
      if (e.code !== 'EEXIST') {
        console.error("Could not create the data directory. ERROR: ", e);
        process.exit(1);
      }
    }
  }
}