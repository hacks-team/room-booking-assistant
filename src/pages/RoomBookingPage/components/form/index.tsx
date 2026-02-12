import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";

import { BookingFormDateField } from "./date-field";
import { BookingFormEquipmentField } from "./equipment-field";
import { BookingFormInputField } from "./input-field";
import { BookingFormSelectField } from "./select-field";

interface BookingFormRootProps<T extends FieldValues = FieldValues> {
  methods: UseFormReturn<T>;
  children: ReactNode;
}

function BookingFormRoot<T extends FieldValues>({ methods, children }: BookingFormRootProps<T>) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

export const BookingForm = Object.assign(BookingFormRoot, {
  DateField: BookingFormDateField,
  SelectField: BookingFormSelectField,
  InputField: BookingFormInputField,
  EquipmentField: BookingFormEquipmentField,
});
