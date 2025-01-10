'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { navigationLinks } from "@/utils/nav-links";
import Image from 'next/image';

type StateSelectionPageProps = {
  states: Record<string, string>;
};

const StateSelection = ({states}: StateSelectionPageProps) => {
  const [selectedStateAbbreviation, setSelectedStateAbbreviation] = useState("");
  const router = useRouter()

  const handleStateSelect = (value: string) => {
    setSelectedStateAbbreviation(value);
  };

  const handleContinue = () => {
    if (selectedStateAbbreviation) {
      router.push(navigationLinks.content({
        stateId: selectedStateAbbreviation
      }))
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="w-full pt-5 flex justify-center mb-4">
          <Image
            src="https://diplomacy.state.gov/wp-content/uploads/2022/10/Panel11front_850_1-600x600-1.jpeg"
            alt="Legislative Guide"
            width={200}
            height={200}
            className="rounded-lg"
          />
        </div>
        <p className="text-xs pt-5 text-gray-500 px-4 text-center mb-4">
          Disclaimer: This is an AI-powered tool to help understand legislation. Information provided should be verified
          with official sources.
        </p>
        <CardHeader>
          <div className="flex justify-center items-center gap-2 mb-2">
            <CardTitle className="text-2xl text-center">AI Bill Assistant</CardTitle>
          </div>
          <CardDescription>
            Select your state to explore and understand bills that could impact your community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select onValueChange={handleStateSelect} value={selectedStateAbbreviation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your state"/>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(states).map(([abbreviation, name]) => (
                  <SelectItem key={abbreviation} value={abbreviation}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleContinue}
            disabled={!selectedStateAbbreviation}
          >
            Explore Bills
          </Button>
          <p className="text-sm text-gray-500">
            Disclaimer: This website is not affiliated with the government. Output by the model may be inaccurate.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StateSelection;