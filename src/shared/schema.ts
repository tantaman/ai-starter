import { definePermissions, createBuilder, Row } from "@rocicorp/zero";
import { schema, type Schema } from "./schema.gen.js";
export { schema, type Schema };

export const permissions = definePermissions<{}, Schema>(schema, () => {
  return {};
});

export type Session = {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
};

export const builder = createBuilder(schema);

export type Opaque<BaseType, BrandType = unknown> = BaseType & {
  readonly [Symbols.base]: BaseType;
  readonly [Symbols.brand]: BrandType;
};

namespace Symbols {
  export declare const base: unique symbol;
  export declare const brand: unique symbol;
}

export type ID_of<T> = Opaque<string, T>;

export type UserId = ID_of<"User">;
type Entity = "User";

export function id<E extends Entity>(id: string): ID_of<E> {
  return id as ID_of<E>;
}

export type User = Row<Schema["tables"]["user"]>;
