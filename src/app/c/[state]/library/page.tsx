import MainNavigation from "@/libs/navigation/main";
import { NextPageProps } from "@/utils/next-props";
import { Library } from "@/libs/library/main";

export default async function LibraryPage(params: NextPageProps<{ state: string }>) {
  const {params: {state}} = await params

  return (
    <MainNavigation title='Library'>
      <Library/>
    </MainNavigation>
  );
}