/** Phaser asset contract: all coordinates use bottom-center anchors for world objects. */
export interface GameAssetSpec {
  key: string;
  path: string;
  size: readonly [number, number];
  origin: readonly [number, number];
}

export const GAME_ASSETS: readonly GameAssetSpec[] = [
  ...['sidewalk_start', 'school_gate', 'traditional_market', 'office_quarter', 'central_park', 'bus_station', 'food_street', 'city_center'].map((id) => ({ key: `loc_${id}`, path: `assets/locations/${id}.png`, size: [242, 245] as const, origin: [0, 0] as const })),
  ...[1, 2, 3, 4, 5].flatMap((tier) => [
    { key: `cart_tier_${tier}`, path: `assets/carts/cart_tier_${tier}.png`, size: [170, 140] as const, origin: [0.5, 1] as const },
    { key: `cart_sign_tier_${tier}`, path: `assets/signs/cart_sign_tier_${tier}.png`, size: [96, 96] as const, origin: [0.5, 1] as const },
    { key: `cart_equipment_tier_${tier}`, path: `assets/props/cart_equipment_tier_${tier}.png`, size: [96, 96] as const, origin: [0.5, 1] as const },
  ]),
  { key: 'player_walk_sheet', path: 'assets/spritesheets/player_walk_sheet.png', size: [190, 50], origin: [0.5, 1] },
  ...['counter', 'planter', 'tree', 'fence', 'crate', 'umbrella', 'bench', 'bus_stop', 'lantern', 'fountain'].map((id) => ({ key: `prop_${id}`, path: `assets/props/prop_${id}.png`, size: [96, 96] as const, origin: [0.5, 1] as const })),
];
