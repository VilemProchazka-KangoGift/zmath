export interface Challenge {
  display: string;
  answer: string;
  inputType: 'numeric' | 'text';
}

export interface ChallengeOptions {
  minResult?: number;
  maxResult?: number;
  operations?: string[];
  nasoblikaTables?: number[];
  nasoblikaDivision?: boolean;  // also generate c ÷ a = ? from tables
  czechLetters?: string[];  // which vyjmenovaná slova groups: 'B','F','L','M','P','S','V','Z'
  failedChallengeDisplays?: Set<string>;  // displays of failed challenges (exempt from de-prioritization)
}

export interface ChallengeProvider {
  id: string;
  name: string;
  generate(difficulty: number, options?: ChallengeOptions): Challenge;
}
