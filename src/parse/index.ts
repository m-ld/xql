import { type Parser, nullContext } from "./common";
import { defaultParser } from "./parser";
import { af, df } from "../common";

import type { JsonValue } from "type-fest";

export const parseQuery = async (
  query: JsonValue,
  parser: Parser = defaultParser
) => {
  const { intermediateResult, operation, projections, warnings } =
    await parser.Document({
      element: query,
      variable: df.variable("root"),
      ctx: nullContext,
    });

  return {
    intermediateResult,
    sparql: af.createProject(operation, projections),
    warnings,
  };
};
