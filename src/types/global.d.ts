// Type definitions for modules without @types

declare module 'bcryptjs' {
  export function hashSync(data: string | Buffer, saltOrRounds: string | number): string;
  export function compareSync(data: string | Buffer, encrypted: string): boolean;
  // Add other methods you use from bcryptjs
}

declare module 'ioredis' {
  import { EventEmitter } from 'events';
  
  interface RedisOptions {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    // Add other options you use
  }

  class Redis extends EventEmitter {
    constructor(options?: RedisOptions);
    // Add methods you use from ioredis
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expiryMode?: string, time?: number): Promise<'OK'>;
    del(key: string): Promise<number>;
  }

  export = Redis;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: any
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: any
  ): JwtPayload | string;
  
  export function decode(token: string, options?: any): JwtPayload | string | null;
}

declare module 'ms' {
  function ms(value: string): number;
  function ms(value: number): string;
  export = ms;
}
