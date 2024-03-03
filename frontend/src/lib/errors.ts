import { AxiosError } from "axios";

export class ApplicationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.statusCode = statusCode;
  }
}

export class ValidationError extends ApplicationError {
  public fields: Array<{ field: any; error: string }>;

  constructor(message: string, fields: Array<{ field: any; error: string }>, statusCode = 422) {
    super(message, statusCode);

    this.fields = fields;
  }
}

export function axiosErrorNormalizer(error: unknown) {
  if (!(error instanceof AxiosError)) return error;

  if (error.response) {
    if (error.response.status === 422) {
      if ("fields" in error.response.data) {
        return new ValidationError(error.response.data.message, error.response.data.fields, error.response.status);
      } else {
        return new ApplicationError(error.response.data.message, error.response.status);
      }
    }

    if (
      typeof error.response.data === "object" &&
      error.response.data &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      return new ApplicationError(error.response.data.message, error.response.status);
    }

    return error.response.data;
  }

  if (error.request) {
    return error.request;
  }
}
