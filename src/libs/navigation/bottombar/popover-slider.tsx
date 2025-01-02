import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LimitSelectorProps = {
  limit: string;
  setLimit: (value: string) => void;
}

const LimitSelector: React.FC<LimitSelectorProps> = ({ limit, setLimit }) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium leading-none">Limit</h4>
      <Select onValueChange={setLimit} defaultValue={limit}>
        <SelectTrigger>
          <SelectValue placeholder="Select a limit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1-25">1-25</SelectItem>
          <SelectItem value="26-50">26-50</SelectItem>
          <SelectItem value="51-75">51-75</SelectItem>
          <SelectItem value="76-100">76-100</SelectItem>
          <SelectItem value="101-125">101-125</SelectItem>
          <SelectItem value="126-150">126-150</SelectItem>
          <SelectItem value="151-175">151-175</SelectItem>
          <SelectItem value="176-200">176-200</SelectItem>
          <SelectItem value="201-225">201-225</SelectItem>
          <SelectItem value="226-250">226-250</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LimitSelector;
