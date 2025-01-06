import { ParsedUrlQuery } from "querystring";

export type NextPageProps<
  Params extends ParsedUrlQuery = ParsedUrlQuery,
  SearchParams extends { [key: string]: string | string[] | undefined } = {
    [key: string]: string | string[] | undefined
  }
> = {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
};