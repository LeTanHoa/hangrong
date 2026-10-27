import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 1. Load the 8 Business Locations Backgrounds (Clean individual PNGs)
    this.load.image('loc_sidewalk_start', 'assets/locations/sidewalk_start.png');
    this.load.image('loc_school_gate', 'assets/locations/school_gate.png');
    this.load.image('loc_traditional_market', 'assets/locations/traditional_market.png');
    this.load.image('loc_office_quarter', 'assets/locations/office_quarter.png');
    this.load.image('loc_central_park', 'assets/locations/central_park.png');
    this.load.image('loc_bus_station', 'assets/locations/bus_station.png');
    this.load.image('loc_food_street', 'assets/locations/food_street.png');
    this.load.image('loc_city_center', 'assets/locations/city_center.png');
    this.load.image('loc_commercial_center', 'assets/locations/commercial_center.png');

    // 2. Load the 5 Cart Tiers (Clean individual transparent PNGs)
    this.load.image('cart_tier_1', 'assets/carts/cart_tier_1.png');
    this.load.image('cart_tier_2', 'assets/carts/cart_tier_2.png');
    this.load.image('cart_tier_3', 'assets/carts/cart_tier_3.png');
    this.load.image('cart_tier_4', 'assets/carts/cart_tier_4.png');
    this.load.image('cart_tier_5', 'assets/carts/cart_tier_5.png');

    // 3. Load Main Player action states
    this.load.image('player_idle', 'assets/characters/player_idle.png');
    this.load.image('player_walk', 'assets/characters/player_walk.png');
    this.load.image('player_cook', 'assets/characters/player_cook.png');
    this.load.image('player_serve', 'assets/characters/player_serve.png');
    this.load.image('player_celebrate', 'assets/characters/player_celebrate.png');

    // 4. Load Staff Chibi Characters
    this.load.image('staff_assistant_1', 'assets/characters/staff_assistant_1.png');
    this.load.image('staff_barista_1', 'assets/characters/staff_barista_1.png');
    this.load.image('staff_mechanic_1', 'assets/characters/staff_mechanic_1.png');
    this.load.image('staff_cook_1', 'assets/characters/staff_cook_1.png');
    this.load.image('staff_cleaner_1', 'assets/characters/staff_cleaner_1.png');
    this.load.image('staff_barber_1', 'assets/characters/staff_barber_1.png');
    this.load.image('staff_marketer_1', 'assets/characters/staff_marketer_1.png');
    this.load.image('staff_cashier_1', 'assets/characters/staff_cashier_1.png');
    this.load.image('staff_baker_1', 'assets/characters/staff_baker_1.png');
    this.load.image('staff_chef_pho_1', 'assets/characters/staff_chef_pho_1.png');
    this.load.image('staff_shipper_1', 'assets/characters/staff_shipper_1.png');
    this.load.image('staff_manager_1', 'assets/characters/staff_manager_1.png');
    this.load.image('staff_supplier', 'assets/characters/staff_supplier.png');

    // 5. Load 12 Distinct Customer Types
    this.load.image('cust_student_school', 'assets/characters/cust_student_school.png');
    this.load.image('cust_student_uni', 'assets/characters/cust_student_uni.png');
    this.load.image('cust_office_worker', 'assets/characters/cust_office_worker.png');
    this.load.image('cust_factory_worker', 'assets/characters/cust_factory_worker.png');
    this.load.image('cust_elderly_citizen', 'assets/characters/cust_elderly_citizen.png');
    this.load.image('cust_neighborhood_auntie', 'assets/characters/cust_neighborhood_auntie.png');
    this.load.image('cust_foreign_tourist', 'assets/characters/cust_foreign_tourist.png');
    this.load.image('cust_food_critic', 'assets/characters/cust_food_critic.png');
    this.load.image('cust_loyal_office_lady', 'assets/characters/cust_loyal_office_lady.png');
    this.load.image('cust_family_with_kids', 'assets/characters/cust_family_with_kids.png');
    this.load.image('cust_delivery_driver', 'assets/characters/cust_delivery_driver.png');
    this.load.image('cust_celebrity_vip', 'assets/characters/cust_celebrity_vip.png');

    // 6. Load Props & Furniture
    // Note: Removed deleted dining table and plastic stools to avoid missing texture boxes on sidewalk

    // Sidewalk shop props (Air pump, tires, toolbox, barber chair, etc.)
    this.load.image('prop_street_sign_post', 'assets/props/prop_street_sign_post.png');
    this.load.image('prop_air_pump', 'assets/props/prop_air_pump.png');
    this.load.image('prop_toolbox', 'assets/props/prop_toolbox.png');
    this.load.image('prop_tires', 'assets/props/prop_tires.png');
    this.load.image('prop_standing_sign_suaxe', 'assets/props/prop_standing_sign_suaxe.png');
    this.load.image('prop_tea_station', 'assets/props/prop_tea_station.png');
    this.load.image('prop_barber_chair', 'assets/props/prop_barber_chair.png');
    this.load.image('prop_barber_pole', 'assets/props/prop_barber_pole.png');
    this.load.image('prop_barber_mirror', 'assets/props/prop_barber_mirror.png');
    this.load.image('prop_standing_sign_cattoc', 'assets/props/prop_standing_sign_cattoc.png');

    // Independent isometric map objects (never use a composite reference poster as an interaction target).
    ['counter', 'planter', 'tree', 'fence', 'crate', 'umbrella', 'bench', 'bus_stop', 'lantern', 'fountain'].forEach((name) =>
      this.load.image(`prop_${name}`, `assets/props/prop_${name}.png`),
    );
    ['sidewalk', 'school', 'market', 'office', 'park', 'bus', 'food_street', 'city'].forEach((name) =>
      this.load.image(`sign_${name}`, `assets/signs/sign_${name}.png`),
    );
    this.load.image('tile_ground_pavement', 'assets/tiles/ground_pavement.png');
    this.load.image('tile_ground_grass', 'assets/tiles/ground_grass.png');
    for (let tier = 1; tier <= 5; tier += 1) {
      this.load.image(`cart_sign_tier_${tier}`, `assets/signs/cart_sign_tier_${tier}.png`);
      this.load.image(`cart_equipment_tier_${tier}`, `assets/props/cart_equipment_tier_${tier}.png`);
    }
    this.load.spritesheet('player_walk_sheet', 'assets/spritesheets/player_walk_sheet.png', { frameWidth: 76, frameHeight: 100 });

    // Multiple Street Screens Backgrounds (1 to 9 matching the 9 Map Locations)
    this.load.image('hang_rong_classic_bg', 'assets/hang_rong_classic.png');
    this.load.image('background_sidewalk', 'assets/background_sidewalk.png');
    for (let s = 1; s <= 9; s++) {
      this.load.image(`background_street_${s}`, `assets/background_street_${s}.png`);
    }
  }

  create() {
    this.createEnvironmentTextures();
    this.createParticleTextures();
    this.createMotorbikeTexture();
    this.anims.create({ key: 'player-walk', frames: this.anims.generateFrameNumbers('player_walk_sheet', { start: 0, end: 4 }), frameRate: 9, repeat: -1 });

    // Transition to main gameplay scene
    this.scene.start('StreetScene');
  }

  private createEnvironmentTextures() {
    // Speech Thought Bubble (HD 2x)
    const bubbleCanvas = document.createElement('canvas');
    bubbleCanvas.width = 108;
    bubbleCanvas.height = 92;
    const bbCtx = bubbleCanvas.getContext('2d')!;
    bbCtx.fillStyle = '#ffffff';
    bbCtx.beginPath();
    bbCtx.roundRect(8, 8, 92, 60, 16);
    bbCtx.fill();
    bbCtx.beginPath();
    bbCtx.moveTo(46, 68);
    bbCtx.lineTo(54, 84);
    bbCtx.lineTo(62, 68);
    bbCtx.closePath();
    bbCtx.fill();
    bbCtx.strokeStyle = '#cbd5e1';
    bbCtx.lineWidth = 3.5;
    bbCtx.stroke();
    this.textures.addCanvas('speech_bubble', bubbleCanvas);
  }

  private createMotorbikeTexture() {
    // HD 2x Motorbike Scooter
    const mbCanvas = document.createElement('canvas');
    mbCanvas.width = 128;
    mbCanvas.height = 96;
    const mCtx = mbCanvas.getContext('2d')!;
    mCtx.fillStyle = '#0f172a';
    mCtx.beginPath();
    mCtx.arc(28, 68, 18, 0, Math.PI * 2);
    mCtx.arc(100, 68, 18, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.fillStyle = '#cbd5e1';
    mCtx.beginPath();
    mCtx.arc(28, 68, 8, 0, Math.PI * 2);
    mCtx.arc(100, 68, 8, 0, Math.PI * 2);
    mCtx.fill();
    mCtx.fillStyle = '#0284c7';
    mCtx.fillRect(36, 44, 52, 16);
    mCtx.fillStyle = '#fde047';
    mCtx.beginPath();
    mCtx.arc(108, 36, 8, 0, Math.PI * 2);
    mCtx.fill();
    this.textures.addCanvas('scooter_bike', mbCanvas);
  }

  private createParticleTextures() {
    const rainCanvas = document.createElement('canvas');
    rainCanvas.width = 8;
    rainCanvas.height = 24;
    const rCtx = rainCanvas.getContext('2d')!;
    rCtx.fillStyle = 'rgba(186, 230, 253, 0.85)';
    rCtx.fillRect(2, 0, 4, 24);
    this.textures.addCanvas('rain_drop', rainCanvas);

    const steamCanvas = document.createElement('canvas');
    steamCanvas.width = 32;
    steamCanvas.height = 32;
    const sCtx = steamCanvas.getContext('2d')!;
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    sCtx.beginPath();
    sCtx.arc(16, 16, 14, 0, Math.PI * 2);
    sCtx.fill();
    this.textures.addCanvas('steam_particle', steamCanvas);
  }
}
