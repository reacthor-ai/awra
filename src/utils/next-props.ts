import { ParsedUrlQuery } from "querystring";

export type NextPageProps<
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  SearchParams extends { [key: string]: string | string[] | undefined } = {
    [key: string]: string | string[] | undefined
  }
> = {
  params: Params;
  searchParams: SearchParams;
};