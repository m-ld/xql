/* eslint-disable no-await-in-loop -- We use this for grouping `expect()`s */
import { describe, expect, it } from "@jest/globals";

import { type ToParse, nullContext, parsed, parseWarning } from "./common";
import { parseGraphObject } from "./parseGraphObject";
import { parseIriEntryValue } from "./parseIriEntryValue";
import { parseListObject } from "./parseListObject";
import { parseNodeObject, parsePrimitive } from "./parseNodeObject";
import { parseSetObject } from "./parseSetObject";
import { parseValueObject } from "./parseValueObject";
import * as IR from "../IntermediateResult";
import { df } from "../common";

import type { JsonValue } from "type-fest";

const variable = df.variable("thing");
const makeToParse = async <Element extends JsonValue>(
  element: Element
): Promise<ToParse<Element>> => ({
  element,
  variable,
  ctx: await nullContext(),
});

describe(parseIriEntryValue, () => {
  it("parses a string, number, or boolean", async () => {
    for (const element of ["Luke Skywalker", 10, true]) {
      const toParse = await makeToParse(element);

      expect(await parseIriEntryValue(toParse)).toStrictEqual(
        await parsePrimitive(toParse)
      );
    }
  });

  it("parses a null", async () => {
    const toParse = await makeToParse(null);

    expect(await parseIriEntryValue(toParse)).toStrictEqual(
      parsed({
        intermediateResult: new IR.NativeValue(null),
        term: variable,
        warnings: [
          parseWarning({
            message: "null values are not yet supported",
          }),
        ],
      })
    );
  });

  it("parses a Node Object", async () => {
    const toParse = await makeToParse({
      "@context": {
        "@vocab": "http://swapi.dev/documentation#",
      },
      name: "Luke Skywalker",
      height: "172",
    });

    expect(await parseIriEntryValue(toParse)).toStrictEqual(
      await parseNodeObject(toParse)
    );
  });

  it("parses a Graph Object, Value Object, List Object, or Set Object", async () => {
    const elements = [
      [parseGraphObject, { "@graph": [] }],
      [parseValueObject, { "@value": "abc" }],
      [parseListObject, { "@list": [] }],
      [parseSetObject, { "@set": [] }],
    ] as const;

    for (const [parser, element] of elements) {
      const toParse = await makeToParse(element);

      expect(await parseIriEntryValue(toParse)).toStrictEqual(
        await parser(toParse)
      );
    }
  });
});
