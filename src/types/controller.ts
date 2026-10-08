export type ControllerAssignment = {
  gamepadIndex: number;
  gamepadId: string;
};

export type RefereeButtonMapping = {
  blue2: number;
  blue3: number;
  red2: number;
  red3: number;
};

export type RefereeButtonAction =
  keyof RefereeButtonMapping;

export type RefereeButtonMappings = Record<
  number,
  RefereeButtonMapping
>;

export type ButtonMappingTarget = {
  refereeId: number;
  action: RefereeButtonAction;
};