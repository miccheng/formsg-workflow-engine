export type FormDefinition = {
  emailField?: string;
  submitterField?: string;
  fields: { [question: string]: string };
};

export type FormResponseDTO = {
  email?: string;
  submitter?: string;
  fields: {
    [name: string]: { question: string; fieldType: string; answer: string };
  };
};

export const parseSubmissionModel = (
  definition: FormDefinition,
  responses: { question: string; fieldType: string; answer: string }[]
): FormResponseDTO => {
  const newResponse: FormResponseDTO = {
    fields: {},
  };

  responses.forEach((field) => {
    if (definition.emailField && field.question === definition.emailField) {
      newResponse.email = field.answer;
    } else if (
      definition.submitterField &&
      field.question === definition.submitterField
    ) {
      newResponse.submitter = field.answer;
    } else {
      const fieldName = Object.prototype.hasOwnProperty.call(
        definition.fields,
        field.question
      )
        ? definition.fields[field.question]
        : field.question;
      newResponse.fields[fieldName] = {
        question: field.question,
        fieldType: field.fieldType,
        answer: field.answer,
      };
    }
  });

  return newResponse;
};
