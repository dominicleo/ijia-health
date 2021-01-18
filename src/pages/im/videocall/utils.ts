export function getLivePlayElementId(value: string | number): string {
  return ['player', value].join('-');
}
