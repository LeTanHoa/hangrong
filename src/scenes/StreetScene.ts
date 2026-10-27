
import Phaser from 'phaser';
import { useGameStore } from '../stores/gameStore';
import { RECIPE_MAP } from '../data/recipes';
import { LOCATIONS, LOCATION_MAP } from '../data/locations';
import { sounds } from '../audio/soundSystem';
import { INITIAL_STAFF } from '../data/staff';

interface CustomerVisual {
  id: string;
  orderId: string;
  sprite: Phaser.GameObjects.Sprite;
  bubbleContainer: Phaser.GameObjects.Container;
  bubbleIcon: Phaser.GameObjects.Text;
  patienceBarBg: Phaser.GameObjects.Rectangle;
  patienceBarFill: Phaser.GameObjects.Rectangle;
  exclamationIcon?: Phaser.GameObjects.Text;
  targetX: number;
  targetY: number;
  isAtDestination: boolean;
  tableIndex?: number;
}

interface ShopCustomerVisual {
  shopId: string;
  requestId: string;
  sprite: Phaser.GameObjects.Sprite;
  speechBubble: Phaser.GameObjects.Container;
  bubbleBg: Phaser.GameObjects.Graphics;
  bobTween?: Phaser.Tweens.Tween;
  hitArea: Phaser.GameObjects.Rectangle;
}

interface AssignedStaffVisual {
  shopId: string;
  staffId: string;
  sprite: Phaser.GameObjects.Sprite;
  badgeContainer: Phaser.GameObjects.Container;
  bobTween?: Phaser.Tweens.Tween;
}

interface SidewalkWalker {
  sprite: Phaser.GameObjects.Sprite;
  direction: 1 | -1;
  speed: number;
}

interface StreetShopDef {
  shopId: string;
  name: string;
  x: number;
  w: number;
  doorX: number;
  message: string;
  isCookingStation?: boolean;
}

const SCREEN_SHOPS_MAP: Record<number, StreetShopDef[]> = {
  1: [
    { shopId: 'banh_mi', name: 'Tiệm Bánh Mì Khởi Nghiệp', x: 200, w: 380, doorX: 200, isCookingStation: true, message: '🥖 Tiệm Bánh Mì: Nơi bắt đầu giấc mơ ẩm thực đường phố!' },
    { shopId: 'sua_xe', name: 'Tiệm Sửa Xe Bác Ba', x: 600, w: 380, doorX: 600, message: '🔧 Bác Ba Sửa Xe: "Xe cộ cần bơm vá cứ qua bác nhé!"' },
    { shopId: 'tra_da', name: 'Quán Nước & Trà Đá Cô Bảy', x: 1000, w: 380, doorX: 1000, message: '☕ Cô Bảy Quán Nước: "Làm ổ bánh mì rồi uống ngụm trà đá mát rượi!"' },
    { shopId: 'cat_toc', name: 'Cắt Tóc Nam Chú Tư', x: 1400, w: 380, doorX: 1400, message: '💈 Chú Tư Hớt Tóc: "Đầu tóc bảnh bao, buôn bán phát tài nhé cháu!"' },
  ],
  2: [
    { shopId: 'school_gate', name: 'Kiosk Cổng Trường Chu Văn An', x: 200, w: 380, doorX: 200, message: '🏫 Cổng Trường Chu Văn An: "Chúc các em học sinh một ngày học tập vui vẻ!"' },
    { shopId: 'boba_tea', name: 'Trà Sữa Boba', x: 600, w: 380, doorX: 600, message: '🧋 Trà Sữa Boba: "Trà sữa trân châu đường đen ngọt mát tuổi học trò!"' },
    { shopId: 'fried_skewers', name: 'Quầy Xiên Que Chiên', x: 1000, w: 380, doorX: 1000, message: '🍢 Quầy Xiên Que: "Cá viên, bò bía nóng hổi sa tế giòn thơm!"' },
    { shopId: 'bookstore', name: 'Nhà Sách Tuổi Thơ', x: 1400, w: 380, doorX: 1400, message: '📚 Nhà Sách Tuổi Thơ: "Đầy đủ truyện tranh và tập vở cho năm học mới!"' },
  ],
  3: [
    { shopId: 'market_gate', name: 'Cổng Chợ Đầu Mối', x: 200, w: 380, doorX: 200, message: '🏛️ Cổng Chợ Đầu Mối: "Khu chợ sầm uất tấp nập giao thương từ 4h sáng!"' },
    { shopId: 'fresh_veggies', name: 'Sạp Rau Củ Đà Lạt', x: 600, w: 380, doorX: 600, message: '🥬 Sạp Rau Củ Đà Lạt: "Rau tươi rói nhập mỗi sớm với giá gốc siêu hời!"' },
    { shopId: 'gio_cha', name: 'Giò Chả Gia Truyền', x: 1000, w: 380, doorX: 1000, message: '🍖 Giò Chả Gia Truyền: "Chả lụa, chả quế thơm ngon nức tiếng đầu ngõ!"' },
    { shopId: 'spice_shop', name: 'Tiệm Gia Vị Đồ Khô', x: 1400, w: 380, doorX: 1400, message: '🌶️ Tiệm Gia Vị Đồ Khô: "Nước mắm nhĩ, tiêu sọ, nấm hương gia vị món gì cũng có!"' },
  ],
  4: [
    { shopId: 'landmark_tower', name: 'Sảnh Landmark Tower', x: 200, w: 380, doorX: 200, message: '🏢 Sảnh Landmark Tower: "Tòa nhà văn phòng cao cấp tập trung giới công sở IT!"' },
    { shopId: 'highland_coffee', name: 'Highland Coffee', x: 600, w: 380, doorX: 600, message: '☕ Highland Coffee: "Cà phê pha máy đậm đà nạp năng lượng ngày dài!"' },
    { shopId: 'bento_box', name: 'Cơm Trưa Bento', x: 1000, w: 380, doorX: 1000, message: '🍱 Quầy Cơm Trưa Bento: "Bento dinh dưỡng eat-clean phục vụ tận bàn làm việc!"' },
    { shopId: 'paris_baguette', name: 'Paris Baguette', x: 1400, w: 380, doorX: 1400, message: '🥐 Paris Baguette: "Bánh croissant bơ Pháp và bánh mì baguette nóng giòn!"' },
  ],
  5: [
    { shopId: 'city_park', name: 'Cổng Công Viên Xanh', x: 200, w: 380, doorX: 200, message: '🌳 Cổng Công Viên Xanh: "Lá phổi xanh râm mát giữa lòng đô thị náo nhiệt!"' },
    { shopId: 'ice_cream', name: 'Kem Tươi Waffle', x: 600, w: 380, doorX: 600, message: '🍦 Kem Tươi Waffle: "Kem dâu, matcha và socola ốc quế mát lạnh ngọt ngào!"' },
    { shopId: 'nuoc_mia', name: 'Nước Mía Siêu Sạch', x: 1000, w: 380, doorX: 1000, message: '🥥 Nước Mía Siêu Sạch: "Nước mía sầu riêng và dừa xiêm giải nhiệt sảng khoái!"' },
    { shopId: 'bike_rental', name: 'Thuê Xe Đạp & Thuyền', x: 1400, w: 380, doorX: 1400, message: '🚲 Thuê Xe Đạp & Thuyền: "Xe đạp dạo quanh hồ và thuyền vịt thư giãn cuối tuần!"' },
  ],
  6: [
    { shopId: 'bus_station', name: 'Bến Xe Liên Tỉnh', x: 200, w: 380, doorX: 200, message: '🚌 Bến Xe Liên Tỉnh: "Các chuyến xe liên tỉnh xuất bến liên tục ngày đêm!"' },
    { shopId: 'com_tam', name: 'Cơm Tấm Sườn Bì', x: 600, w: 380, doorX: 600, message: '🍛 Cơm Tấm Sườn Bì: "Cơm sườn nướng than thơm phức cho khách đường xa!"' },
    { shopId: 'banh_bao', name: 'Quầy Bánh Bao Nóng', x: 1000, w: 380, doorX: 1000, message: '🥟 Quầy Bánh Bao Nóng: "Bánh bao xá xíu trứng cút nóng hổi ăn ngay kịp chuyến xe!"' },
    { shopId: 'kiosk_drinks', name: 'Kiosk Nước & Sim Thẻ', x: 1400, w: 380, doorX: 1400, message: '🥤 Kiosk Nước & Sim Thẻ: "Nước giải khát ướp lạnh và báo chí đi đường tiện lợi!"' },
  ],
  7: [
    { shopId: 'pho_bo', name: 'Quán Phở Bò Bác Năm', x: 200, w: 380, doorX: 200, message: '🍜 Bác Năm Phở Bò: "Nước dùng hầm xương 12 tiếng, thơm lừng góc phố!"' },
    { shopId: 'tap_hoa', name: 'Tiệm Tạp Hoá Cô Ba', x: 600, w: 380, doorX: 600, message: '🏪 Cô Ba Tạp Hoá: "Cần bánh kẹo, nước ngọt hay đồ gia dụng cứ ghé cô nhé!"' },
    { shopId: 'banh_trang', name: 'Bánh Tráng Trộn Bé Út', x: 1000, w: 380, doorX: 1000, message: '🌶️ Bé Út Bánh Tráng: "Bánh tráng trộn muối tôm tắc, cá viên chiên giòn rụm đây!"' },
    { shopId: 'sua_khoa', name: 'Tiệm Sửa Khoá Chú Sáu', x: 1400, w: 380, doorX: 1400, message: '🔑 Chú Sáu Sửa Khoá: "Đánh chìa lấy liền 1 phút, may vá quần áo tận tâm!"' },
  ],
  8: [
    { shopId: 'luxury_mall', name: 'Landmark Luxury Mall', x: 200, w: 380, doorX: 200, message: '💎 Landmark Luxury Mall: "Đại sảnh trung tâm thương mại lộng lẫy và sang trọng!"' },
    { shopId: 'kiosk_5star', name: 'Kiosk Ẩm Thực 5 Sao', x: 600, w: 380, doorX: 600, message: '🍽️ Kiosk Ẩm Thực 5 Sao: "Bánh mì gourmet bò Wagyu và ẩm thực fusion đỉnh cao!"' },
    { shopId: 'bingsu', name: 'Bingsu Hoàng Gia', x: 1000, w: 380, doorX: 1000, message: '🍧 Bingsu Hoàng Gia: "Bingsu tuyết xoài và trà hoa quả hoàng tộc thanh mát!"' },
    { shopId: 'french_pastry', name: 'French Pastry Pháp', x: 1400, w: 380, doorX: 1400, message: '🍰 French Pastry Pháp: "Bánh ngọt châu Âu và tháp macaron tuyệt hảo!"' },
  ],
  9: [
    { shopId: 'coop_bakery', name: 'Co.op Bakery', x: 240, w: 450, doorX: 240, message: '🥖 Co.op Bakery: "Bánh mì tươi nóng giòn ra lò mỗi 15 phút, thơm lừng góc siêu thị!"' },
    { shopId: 'coop_hypermarket', name: 'Siêu Thị Co.opmart Đà Nẵng', x: 600, w: 450, doorX: 600, message: '🛒 Siêu Thị Co.opmart Đà Nẵng: "Kính chào quý khách! Hàng ngàn mặt hàng bình ổn giá đang chờ bạn!"' },
    { shopId: 'coop_service', name: 'Quầy Dịch Vụ Khách Hàng', x: 1000, w: 350, doorX: 1000, message: '💁 Quầy Dịch Vụ Khách Hàng: "Đổi điểm tích luỹ, giao hàng tận nơi & gói quà miễn phí!"' },
    { shopId: 'coop_foodcourt', name: 'Food Court Co.opmart', x: 1360, w: 350, doorX: 1360, message: '🍱 Food Court Co.opmart: "Ẩm thực tự chọn đa dạng, sạch sẽ, giá cả bình dân cho mọi nhà!"' },
  ],
};

export class StreetScene extends Phaser.Scene {
  private bgImage!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Sprite;
  private cartSprite!: Phaser.GameObjects.Sprite;
  private cartSignSprite!: Phaser.GameObjects.Sprite;
  private cartEquipmentSprite!: Phaser.GameObjects.Sprite;
  private steamEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private tableGroup!: Phaser.GameObjects.Group;
  private mapPropGroup!: Phaser.GameObjects.Group;
  private streetShopsGroup!: Phaser.GameObjects.Group;
  private ownedShopVisitorsGroup!: Phaser.GameObjects.Group;
  private shopVisitorTimer?: Phaser.Time.TimerEvent;
  private screenNavGroup!: Phaser.GameObjects.Group;
  private streetSignSubText!: Phaser.GameObjects.Text;
  private streetSignMainText!: Phaser.GameObjects.Text;
  private streetSignCartBadgeBg!: Phaser.GameObjects.Rectangle;
  private streetSignCartBadgeText!: Phaser.GameObjects.Text;
  private streetSignReturnBtn!: Phaser.GameObjects.Text;
  private currentStreetScreen = 1;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };
  private playerTargetX: number | null = null;
  private playerTargetY: number | null = null;
  private customerVisuals: Map<string, CustomerVisual> = new Map();
  private sidewalkWalkers: SidewalkWalker[] = [];
  private shopCustomerVisuals: Map<string, ShopCustomerVisual> = new Map();
  private assignedStaffVisuals: Map<string, AssignedStaffVisual> = new Map();
  private scooterGroup!: Phaser.GameObjects.Group;
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private isRaining = false;
  private lightOverlay!: Phaser.GameObjects.Rectangle;
  private spawnTimer = 0;
  private currentLocationId = '';
  private currentCartTier = 1;
  private unsubscribeCartUpgrade?: () => void;
  private walkBobTimer = 0;

  constructor() {
    super({ key: 'StreetScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    const store = useGameStore.getState();

    this.sys.displayList.events.on(
      Phaser.Scenes.Events.ADDED_TO_SCENE,
      this.removeMissingTexturePlaceholder,
      this,
    );

    const activeLoc = LOCATION_MAP[store.currentLocationId];
    if (!activeLoc || activeLoc.requiredLevel > store.level) {
      this.currentLocationId = 'sidewalk_start';
      this.currentStreetScreen = 1;
      useGameStore.setState({
        currentLocationId: 'sidewalk_start',
        unlockedLocations: store.unlockedLocations.filter((id) => {
          const l = LOCATION_MAP[id];
          return l && l.requiredLevel <= store.level;
        }),
      });
      useGameStore.getState().saveCurrentGame();
    } else {
      this.currentLocationId = store.currentLocationId || 'sidewalk_start';
      const initLocIndex = LOCATIONS.findIndex((l) => l.id === this.currentLocationId);
      this.currentStreetScreen = initLocIndex >= 0 ? initLocIndex + 1 : 1;
    }
    if (store.activeModal) {
      this.input.enabled = false;
    }
    this.unsubscribeCartUpgrade = useGameStore.subscribe((state, previousState) => {
      if (state.cartTier !== previousState.cartTier) {
        this.currentCartTier = state.cartTier;
        this.handleCartUpgraded();
      }
      if (state.shopLevels !== previousState.shopLevels) {
        this.rebuildStreetShops();
        this.updateShopCustomerVisuals();
        this.updateAssignedStaffVisuals();
      }
      if (state.shopCustomerRequests !== previousState.shopCustomerRequests) {
        this.updateShopCustomerVisuals();
      }
      if (state.staffAssignments !== previousState.staffAssignments || state.staff !== previousState.staff) {
        this.updateAssignedStaffVisuals();
      }
      if (state.activeModal !== previousState.activeModal) {
        this.input.enabled = !state.activeModal;
        if (state.activeModal) {
          this.playerTargetX = null;
          this.playerTargetY = null;
        }
      }
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeCartUpgrade?.();
      this.unsubscribeCartUpgrade = undefined;
      this.shopVisitorTimer?.destroy();
      this.shopVisitorTimer = undefined;
      this.clearAllShopCustomerVisuals();
      this.clearAllAssignedStaffVisuals();
      this.sys.displayList.events.off(
        Phaser.Scenes.Events.ADDED_TO_SCENE,
        this.removeMissingTexturePlaceholder,
        this,
      );
    });
    const loc = LOCATION_MAP[this.currentLocationId] || LOCATION_MAP['sidewalk_start'];

    // 1. Dynamic Location Background (Isometric 2.5D Area)
    this.bgImage = this.add.image(0, 0, `background_street_${this.currentStreetScreen}`);
    this.bgImage.setOrigin(0, 0);
    this.bgImage.setDisplaySize(width, height);
    this.bgImage.setDepth(0);

    // 2. Groups
    this.tableGroup = this.add.group();
    this.streetShopsGroup = this.add.group();
    this.ownedShopVisitorsGroup = this.add.group();
    this.screenNavGroup = this.add.group();
    this.mapPropGroup = this.add.group();

    // 3. Dynamic Cart (Tier 1 to 5) - Situated at Shop 2 (Tiệm Bánh Mì)
    const cartX = loc.cartLayout.x;
    const cartY = loc.cartLayout.y;
    const cartScale = loc.cartLayout.scale || 0.85;
    this.currentCartTier = store.cartTier || 1;
    const cartKey = this.textures.exists(`cart_tier_${this.currentCartTier}`)
      ? `cart_tier_${this.currentCartTier}`
      : 'cart_tier_1';

    this.cartSprite = this.add.sprite(cartX, cartY, cartKey);
    this.cartSprite.setOrigin(0.5, 1);
    this.cartSprite.setScale(cartScale);
    this.cartSprite.setDepth(cartY);
    // Use the cart's opaque pixels as its hit area so transparent image padding is not clickable.
    this.cartSprite.setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
      useHandCursor: true,
    });
    this.cartSprite.on('pointerdown', () => {
      if (useGameStore.getState().activeModal) return;
      useGameStore.getState().openCookingStation();
    });

    const signKey = `cart_sign_tier_${this.currentCartTier}`;
    const validSignKey = this.textures.exists(signKey) ? signKey : 'cart_sign_tier_1';
    this.cartSignSprite = this.add.sprite(cartX + 104, cartY - 96, validSignKey).setOrigin(0.5, 1).setScale(1.04).setDepth(cartY + 1);

    const equipKey = `cart_equipment_tier_${this.currentCartTier}`;
    const validEquipKey = this.textures.exists(equipKey) ? equipKey : 'cart_equipment_tier_1';
    this.cartEquipmentSprite = this.add.sprite(cartX - 36, cartY + 14, validEquipKey).setOrigin(0.5, 1).setScale(0.84).setDepth(cartY + 3);

    // A click on an interactive shop/cart must not fall through to the street movement handler.
    this.input.setTopOnly(true);

    // Steam particles rising from the cart's stove
    this.steamEmitter = this.add
      .particles(cartX - 20, cartY - 50, 'steam_particle', {
        lifespan: 1100,
        speedY: { min: -50, max: -90 },
        scale: { start: 0.8, end: 1.8 },
        alpha: { start: 0.6, end: 0 },
        frequency: 250,
      })
      .setDepth(cartY + 2);

    // 4. Main Player Character (Bé Hàng Rong) - HD 1600x1040 crisp chibi
    this.player = this.add.sprite(cartX - 90, cartY + 30, 'player_idle');
    this.player.setOrigin(0.5, 1);
    this.player.setScale(0.75);
    this.player.setDepth(cartY + 30);

    // 5. Rebuild balanced shops, tables and navigation buttons
    this.rebuildTablesAndStools();
    this.rebuildStreetShops();
    this.updateShopCustomerVisuals();
    this.updateAssignedStaffVisuals();
    this.createSidewalkWalkers();
    this.setupScreenNavigation(width, height);

    // 6. Motorbike traffic group in the street (cruises along roadway below curb)
    this.scooterGroup = this.add.group();
    this.time.addEvent({
      delay: 5500,
      callback: () => this.spawnPassingScooter(),
      loop: true,
    });

    // 7. Rain particles
    this.createRainEffect();

    // 8. Lighting tint overlay for Day/Night cycle
    this.lightOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
    this.lightOverlay.setDepth(1000);

    // 9. Input handlers
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D,E,SPACE') as {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
        E: Phaser.Input.Keyboard.Key;
        SPACE: Phaser.Input.Keyboard.Key;
      };
    }

    // Click / Tap to move on sidewalk pavement with visual ripple feedback
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[] = []) => {
      if (useGameStore.getState().activeModal) return;
      if (currentlyOver.length > 0) return;
      const zone = loc.walkZone;
      if (pointer.y >= 450 && pointer.y <= 1020) {
        const targetX = Phaser.Math.Clamp(pointer.x, zone.minX, zone.maxX);
        const targetY = Phaser.Math.Clamp(pointer.y, zone.minY, zone.maxY);
        this.playerTargetX = targetX;
        this.playerTargetY = targetY;

        // Visual tap ripple feedback on sidewalk
        const ripple = this.add.circle(targetX, targetY, 8, 0xfbbf24, 0.85);
        ripple.setDepth(targetY - 1);
        this.tweens.add({
          targets: ripple,
          radius: 30,
          alpha: 0,
          duration: 380,
          ease: 'Quad.easeOut',
          onComplete: () => ripple.destroy(),
        });
      }
    });

    // Tap and drag to walk along sidewalk
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[] = []) => {
      if (!pointer.isDown || useGameStore.getState().activeModal) return;
      if (currentlyOver.length > 0) return;
      if (pointer.y >= 450 && pointer.y <= 1020) {
        const zone = loc.walkZone;
        this.playerTargetX = Phaser.Math.Clamp(pointer.x, zone.minX, zone.maxX);
        this.playerTargetY = Phaser.Math.Clamp(pointer.y, zone.minY, zone.maxY);
      }
    });

    // IMMEDIATE CUSTOMERS: Ensure 2 customers on startup
    if (store.orders.length === 0) {
      store.spawnCustomerOrder(0);
      store.spawnCustomerOrder(1);
    }

    // Initialize Map Props and navigation labels matching active location
    this.rebuildMapProps();
    this.updateScreenNavLabel();

    // Recurring customer visits to purchased/owned storefronts
    this.shopVisitorTimer = this.time.addEvent({
      delay: 8500,
      callback: () => this.spawnOwnedShopVisitor(),
      loop: true,
    });
  }

  /** Keeps sidewalk clean and spacious (tables and stools removed) */
  private rebuildTablesAndStools() {
    this.tableGroup.clear(true, true);
  }

  private removeMissingTexturePlaceholder(gameObject: Phaser.GameObjects.GameObject) {
    const texture = (gameObject as Phaser.GameObjects.Image | Phaser.GameObjects.Sprite).texture;
    if (texture?.key !== '__MISSING') return;

    console.warn(`Removed Phaser missing-texture placeholder: ${gameObject.type}`);
    gameObject.destroy();
  }

  /** Decorative foot traffic uses its own sprites and never enters the food order queue. */
  private createSidewalkWalkers() {
    const walkers = [
      { key: 'cust_student_uni', x: 80, y: 585, direction: 1 as const, speed: 54 },
      { key: 'cust_neighborhood_auntie', x: 530, y: 640, direction: -1 as const, speed: 42 },
      { key: 'cust_delivery_driver', x: 980, y: 600, direction: 1 as const, speed: 68 },
      { key: 'cust_elderly_citizen', x: 1480, y: 660, direction: -1 as const, speed: 34 },
      { key: 'cust_office_worker', x: 1190, y: 570, direction: -1 as const, speed: 58 },
    ];

    this.sidewalkWalkers = walkers.map(({ key, x, y, direction, speed }) => {
      const sprite = this.add.sprite(x, y, key);
      sprite.setOrigin(0.5, 1);
      sprite.setScale(0.48);
      sprite.setFlipX(direction < 0);
      sprite.setDepth(y);
      sprite.setAlpha(0.96);
      this.tweens.add({
        targets: sprite,
        y: y - 3,
        duration: 420 + Phaser.Math.Between(0, 260),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      return { sprite, direction, speed };
    });
  }

  private updateSidewalkWalkers(deltaSeconds: number) {
    const width = this.scale.width;
    this.sidewalkWalkers.forEach(({ sprite, direction, speed }) => {
      sprite.x += direction * speed * deltaSeconds;
      if (direction > 0 && sprite.x > width + 90) sprite.x = -90;
      else if (direction < 0 && sprite.x < -90) sprite.x = width + 90;
      sprite.setDepth(sprite.y);
    });
  }

  /** Balanced storefronts and clean sidewalk layout with dynamic illumination for owned/unowned shops */
  private rebuildStreetShops() {
    this.streetShopsGroup.clear(true, true);
    this.ownedShopVisitorsGroup.clear(true, true);
    const store = useGameStore.getState();

    const shopsOnScreen = SCREEN_SHOPS_MAP[this.currentStreetScreen] || [];

    shopsOnScreen.forEach((shop) => {
      const isOwned = (store.shopLevels[shop.shopId] || 0) > 0;

      if (!isOwned) {
        // ================= CỬA HÀNG CHƯA MUA: CHỈ HIỂN THỊ NÚT CHƯA MUA (KHÔNG CÓ LỚP NỀN ĐEN MỜ) =================
        const lockBadgeBg = this.add.rectangle(shop.x, 225, 134, 34, 0x0f172a, 0.92)
          .setStrokeStyle(1.8, 0x64748b)
          .setDepth(21);
        const lockBadgeText = this.add.text(shop.x, 225, '🔒 Chưa Mua', {
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          fontSize: '12.5px',
          fontStyle: 'bold',
          color: '#cbd5e1',
        }).setOrigin(0.5).setDepth(22);

        lockBadgeBg.setInteractive({ useHandCursor: true });

        const openShop = () => {
          if (useGameStore.getState().activeModal) return;
          sounds.playClick();
          store.openShopWorkstation(shop.shopId);
        };

        const onHover = () => {
          lockBadgeBg.setStrokeStyle(2.2, 0xf59e0b).setFillStyle(0x1e293b, 0.96);
          lockBadgeText.setColor('#fde047').setText('🛒 Bấm Để Mua');
          this.tweens.add({
            targets: [lockBadgeBg, lockBadgeText],
            scaleX: 1.06,
            scaleY: 1.06,
            duration: 120,
            ease: 'Quad.easeOut',
          });
        };

        const onOut = () => {
          lockBadgeBg.setStrokeStyle(1.8, 0x64748b).setFillStyle(0x0f172a, 0.92);
          lockBadgeText.setColor('#cbd5e1').setText('🔒 Chưa Mua');
          this.tweens.add({
            targets: [lockBadgeBg, lockBadgeText],
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 120,
            ease: 'Quad.easeOut',
          });
        };

        lockBadgeBg.on('pointerover', onHover);
        lockBadgeBg.on('pointerout', onOut);
        lockBadgeBg.on('pointerdown', openShop);

        // Transparent door click zone (0 alpha) for smooth intuitive clicking without dimming artwork
        const doorClickZone = this.add.rectangle(shop.doorX, 360, 110, 220, 0x000000, 0)
          .setInteractive({ useHandCursor: true })
          .setDepth(20);
        doorClickZone.on('pointerover', onHover);
        doorClickZone.on('pointerout', onOut);
        doorClickZone.on('pointerdown', openShop);

        this.streetShopsGroup.addMultiple([doorClickZone, lockBadgeBg, lockBadgeText]);
      } else {
        // ================= CỬA HÀNG ĐÃ MUA: SÁNG NỔI BẬT LÊN + ĐÈN TREO ẤM ÁP =================
        // 1. Ánh sáng vàng ấm bao phủ mặt tiền
        const warmGlow = this.add.ellipse(shop.x, 270, shop.w * 0.85, 270, 0xfef08a, 0.18).setDepth(2);
        this.tweens.add({
          targets: warmGlow,
          alpha: 0.28,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // 2. Hai bóng đèn vàng ấm lung linh dưới mái hiên
        const lampL = this.add.circle(shop.x - 70, 155, 5, 0xfde047, 0.95).setDepth(4);
        const lampR = this.add.circle(shop.x + 70, 155, 5, 0xfde047, 0.95).setDepth(4);
        const haloL = this.add.circle(shop.x - 70, 155, 24, 0xfef08a, 0.35).setDepth(3);
        const haloR = this.add.circle(shop.x + 70, 155, 24, 0xfef08a, 0.35).setDepth(3);
        this.tweens.add({
          targets: [haloL, haloR],
          alpha: 0.16,
          duration: 1300 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // 3. Huy hiệu xanh lục báo hiệu cửa hàng đang mở cửa hoạt động
        const level = store.shopLevels[shop.shopId] || 1;
        const activeBadgeBg = this.add.rectangle(shop.x, 68, 130, 22, 0x064e3b, 0.92)
          .setStrokeStyle(1.5, 0x10b981)
          .setDepth(4);
        const activeBadgeText = this.add.text(shop.x, 68, `✨ CẤP ${level} • ĐANG MỞ`, {
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#6ee7b7',
        }).setOrigin(0.5).setDepth(5);

        // 4. Vùng click tương tác
        const shopZone = this.add.rectangle(shop.x, 240, shop.w, 460, 0x000000, 0).setDepth(20);
        shopZone.setInteractive({ useHandCursor: true });
        shopZone.on('pointerdown', () => {
          if (useGameStore.getState().activeModal) return;
          sounds.playClick();
          store.openShopWorkstation(shop.shopId);
        });

        this.streetShopsGroup.addMultiple([warmGlow, lampL, lampR, haloL, haloR, activeBadgeBg, activeBadgeText, shopZone]);
      }
    });

    // Bus Stop on curb (always available at x: 1550, y: 884)
    const busStop = this.add.sprite(1550, 884, 'prop_bus_stop').setOrigin(0.5, 1).setScale(1.5).setDepth(884);
    busStop.setInteractive({ useHandCursor: true });
    busStop.on('pointerdown', () => {
      if (useGameStore.getState().activeModal) return;
      sounds.playClick();
      store.openModal('SMARTPHONE', 'MAP');
    });

    const busLabel = this.add.text(1550, 892, 'XE BUÝT', {
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#0284c7',
      padding: { left: 8, right: 8, top: 2, bottom: 2 },
    }).setOrigin(0.5, 0).setDepth(888);

    // Fire hydrant on curb
    const fireHydrantZone = this.add.rectangle(380, 800, 72, 96, 0x000000, 0);
    fireHydrantZone.setInteractive({ useHandCursor: true });
    fireHydrantZone.setDepth(870);
    fireHydrantZone.on('pointerdown', () => {
      if (useGameStore.getState().activeModal) return;
      sounds.playClick();
      this.showFloatingMessage(380, 690, '🧯 Trụ cứu hoả: Bảo vệ an toàn phòng cháy cho cả con phố!');
    });

    this.streetShopsGroup.addMultiple([busStop, busLabel, fireHydrantZone]);
  }

  /** Spawns animated pedestrians visiting shops that are purchased / owned */
  private spawnOwnedShopVisitor() {
    if (useGameStore.getState().activeModal) return;
    const store = useGameStore.getState();
    const shopsOnScreen = SCREEN_SHOPS_MAP[this.currentStreetScreen] || [];
    const ownedShops = shopsOnScreen.filter((s) => (store.shopLevels[s.shopId] || 0) > 0);
    if (ownedShops.length === 0) return;

    // Pick a random owned shop to visit
    const targetShop = Phaser.Utils.Array.GetRandom(ownedShops);

    const customerKeys = [
      'cust_student_uni',
      'cust_office_worker',
      'cust_delivery_driver',
      'cust_elderly_citizen',
      'cust_neighborhood_auntie',
      'cust_student_school',
      'cust_factory_worker',
      'cust_food_critic',
    ];
    const key = Phaser.Utils.Array.GetRandom(customerKeys);
    if (!this.textures.exists(key)) return;

    // Start on sidewalk near shop
    const startX = targetShop.doorX + Phaser.Math.Between(-60, 60);
    const startY = Phaser.Math.Between(610, 670);

    const visitor = this.add.sprite(startX, startY, key);
    visitor.setOrigin(0.5, 1);
    visitor.setScale(0.48);
    visitor.setDepth(startY);
    visitor.setFlipX(targetShop.doorX < startX);
    this.ownedShopVisitorsGroup.add(visitor);

    // Phase 1: Walk to shop entrance
    this.tweens.add({
      targets: visitor,
      x: targetShop.doorX,
      y: 485,
      scaleX: 0.42,
      scaleY: 0.42,
      duration: 1800,
      ease: 'Linear',
      onUpdate: () => {
        visitor.setDepth(visitor.y);
      },
      onComplete: () => {
        // Phase 2: Enter & show shopping emote
        visitor.setAlpha(0.4);
        const emoteText = Phaser.Utils.Array.GetRandom(['🛍️', '🥖', '☕', '🍜', '😋', '⭐', '💰', '✨']);
        const emote = this.add.text(targetShop.doorX, 420, emoteText, {
          fontSize: '22px',
        }).setOrigin(0.5).setDepth(600);

        this.tweens.add({
          targets: emote,
          y: 380,
          alpha: 0,
          duration: 1400,
          ease: 'Sine.easeOut',
          onComplete: () => emote.destroy(),
        });

        // Phase 3: Exit shop after shopping
        this.time.delayedCall(1300, () => {
          if (!visitor.active) return;
          visitor.setAlpha(1.0);
          const exitDir = Math.random() > 0.5 ? 1 : -1;
          const exitX = Phaser.Math.Clamp(targetShop.doorX + exitDir * Phaser.Math.Between(120, 220), 80, 1520);
          const exitY = Phaser.Math.Between(620, 680);
          visitor.setFlipX(exitDir < 0);

          this.tweens.add({
            targets: visitor,
            x: exitX,
            y: exitY,
            scaleX: 0.48,
            scaleY: 0.48,
            duration: 2100,
            ease: 'Linear',
            onUpdate: () => {
              visitor.setDepth(visitor.y);
            },
            onComplete: () => {
              this.tweens.add({
                targets: visitor,
                alpha: 0,
                duration: 600,
                onComplete: () => visitor.destroy(),
              });
            },
          });
        });
      },
    });
  }

  /**
   * Updates customer characters standing in front of owned shops
   * displaying their specific service requests in speech bubbles.
   */
  private updateShopCustomerVisuals() {
    const store = useGameStore.getState();
    const shopsOnScreen = SCREEN_SHOPS_MAP[this.currentStreetScreen] || [];
    const activeShopIdsOnScreen = new Set(shopsOnScreen.map((s) => s.shopId));

    // 1. Remove or animate departure for requests that no longer exist or belong to other screens
    this.shopCustomerVisuals.forEach((visual, shopId) => {
      const currentReq = store.shopCustomerRequests[shopId];
      const isShopOnScreen = activeShopIdsOnScreen.has(shopId);

      // If shop is offscreen or shop is unowned:
      if (!isShopOnScreen || (store.shopLevels[shopId] || 0) <= 0) {
        visual.bobTween?.stop();
        visual.speechBubble.destroy();
        visual.sprite.destroy();
        this.shopCustomerVisuals.delete(shopId);
      } else if (!currentReq || currentReq.id !== visual.requestId) {
        // Customer was served! Play celebratory exit
        this.playCustomerServedCelebration(visual, !currentReq);
        this.shopCustomerVisuals.delete(shopId);
      }
    });

    // 2. Add or maintain visuals for current requests on this screen
    shopsOnScreen.forEach((shop) => {
      const isOwned = (store.shopLevels[shop.shopId] || 0) > 0;
      const req = store.shopCustomerRequests[shop.shopId];

      if (!isOwned || !req) return;

      // If visual already exists with the same requestId, keep it
      const existingVisual = this.shopCustomerVisuals.get(shop.shopId);
      if (existingVisual && existingVisual.requestId === req.id) {
        return;
      }

      // Stand in front of shop entrance counter on sidewalk
      const standX = shop.doorX + (shop.w > 400 ? 0 : 25);
      const standY = 525;

      let spriteKey = req.customerSpriteKey;
      if (!this.textures.exists(spriteKey)) {
        spriteKey = 'cust_office_worker';
        if (!this.textures.exists(spriteKey)) {
          spriteKey = 'player_idle';
        }
      }

      const sprite = this.add.sprite(standX, standY, spriteKey);
      sprite.setOrigin(0.5, 1);
      sprite.setScale(0.48);
      sprite.setDepth(standY);
      sprite.setInteractive({ useHandCursor: true });

      // Customer subtle idle bob tween
      this.tweens.add({
        targets: sprite,
        y: standY - 4,
        duration: 480 + Phaser.Math.Between(0, 160),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // --- SPEECH BUBBLE CONTAINER ---
      const bubbleContainer = this.add.container(standX, standY - 100);
      bubbleContainer.setDepth(standY + 30);

      const cleanServiceName = req.serviceName.length > 22
        ? req.serviceName.slice(0, 21) + '…'
        : req.serviceName;

      const bubbleW = Math.max(168, Math.min(235, cleanServiceName.length * 8.2 + 56));
      const bubbleH = 42;

      // Bubble background graphics
      const bubbleBg = this.add.graphics();
      this.drawSpeechBubbleGraphics(bubbleBg, bubbleW, bubbleH, 0x0f172a, 0xf59e0b, 2);

      // Service icon (left)
      const iconText = this.add.text(-bubbleW / 2 + 18, -21, req.serviceIcon, {
        fontSize: '18px',
      }).setOrigin(0.5);

      // Service name text (top line)
      const nameText = this.add.text(-bubbleW / 2 + 35, -21, cleanServiceName, {
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#fef08a',
      }).setOrigin(0, 0.5);

      // Subtitle (bottom line): "⚡ Phục vụ: +XX.XXXđ"
      const hintText = this.add.text(0, -5, `⚡ Phục vụ: +${req.payout.toLocaleString('vi-VN')}đ`, {
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#38bdf8',
      }).setOrigin(0.5);

      bubbleContainer.add([bubbleBg, iconText, nameText, hintText]);

      // Clickable area for bubble
      const hitArea = this.add.rectangle(0, -12, bubbleW, bubbleH + 12, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      bubbleContainer.add(hitArea);

      // Floating bob tween for speech bubble
      const bubbleBob = this.tweens.add({
        targets: bubbleContainer,
        y: standY - 108,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Hover glow effects
      const onHover = () => {
        this.drawSpeechBubbleGraphics(bubbleBg, bubbleW, bubbleH, 0x1e293b, 0xfacc15, 2.8);
        bubbleContainer.setScale(1.06);
        sprite.setTint(0xfffbeb);
      };
      const onOut = () => {
        this.drawSpeechBubbleGraphics(bubbleBg, bubbleW, bubbleH, 0x0f172a, 0xf59e0b, 2);
        bubbleContainer.setScale(1.0);
        sprite.clearTint();
      };

      hitArea.on('pointerover', onHover);
      hitArea.on('pointerout', onOut);
      sprite.on('pointerover', onHover);
      sprite.on('pointerout', onOut);

      // Click to open workstation modal focused on this customer's exact service
      const handleServeClick = () => {
        if (useGameStore.getState().activeModal) return;
        sounds.playClick();
        store.openShopWorkstation(shop.shopId, req.serviceId);
      };

      hitArea.on('pointerdown', handleServeClick);
      sprite.on('pointerdown', handleServeClick);

      this.shopCustomerVisuals.set(shop.shopId, {
        shopId: shop.shopId,
        requestId: req.id,
        sprite,
        speechBubble: bubbleContainer,
        bubbleBg,
        bobTween: bubbleBob,
        hitArea,
      });
    });
  }

  private drawSpeechBubbleGraphics(
    g: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    bgColor: number,
    borderColor: number,
    borderWidth: number,
  ) {
    g.clear();
    const bx = -width / 2;
    const by = -height + 10;

    g.fillStyle(bgColor, 0.95);
    g.lineStyle(borderWidth, borderColor, 1);
    g.fillRoundedRect(bx, by, width, height, 10);
    g.strokeRoundedRect(bx, by, width, height, 10);

    // Pointer arrow pointing down to customer's head
    g.beginPath();
    g.moveTo(-7, 10);
    g.lineTo(0, 19);
    g.lineTo(7, 10);
    g.closePath();
    g.fillStyle(bgColor, 0.95);
    g.fillPath();
    g.strokePath();

    // Line to clear internal border between bubble and arrow
    g.lineStyle(borderWidth + 1, bgColor, 1);
    g.lineBetween(-6, 10, 6, 10);
  }

  private playCustomerServedCelebration(visual: ShopCustomerVisual, isSuccess: boolean) {
    const { sprite, speechBubble, bobTween } = visual;
    bobTween?.stop();
    speechBubble.destroy();

    if (isSuccess) {
      // Floating appreciation emote
      const emote = this.add.text(sprite.x, sprite.y - 95, '💖 ⭐⭐⭐⭐⭐ Cảm ơn!', {
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#4ade80',
        stroke: '#052e16',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(1500);

      this.tweens.add({
        targets: emote,
        y: emote.y - 42,
        alpha: 0,
        duration: 1600,
        ease: 'Sine.easeOut',
        onComplete: () => emote.destroy(),
      });

      // Customer joyful hop then departure
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 14,
        duration: 180,
        yoyo: true,
        repeat: 1,
        ease: 'Quad.easeOut',
        onComplete: () => {
          const exitDir = Math.random() > 0.5 ? 1 : -1;
          sprite.setFlipX(exitDir < 0);
          this.tweens.add({
            targets: sprite,
            x: sprite.x + exitDir * 150,
            y: sprite.y + 60,
            alpha: 0,
            duration: 1400,
            ease: 'Linear',
            onComplete: () => sprite.destroy(),
          });
        },
      });
    } else {
      sprite.destroy();
    }
  }

  private clearAllShopCustomerVisuals() {
    this.shopCustomerVisuals.forEach((v) => {
      v.bobTween?.stop();
      v.speechBubble.destroy();
      v.sprite.destroy();
    });
    this.shopCustomerVisuals.clear();
  }

  /**
   * Renders assigned staff chibi sprites standing at shop fronts
   * with a staff name badge.
   */
  private updateAssignedStaffVisuals() {
    const store = useGameStore.getState();
    const shopsOnScreen = SCREEN_SHOPS_MAP[this.currentStreetScreen] || [];
    const activeShopIdsOnScreen = new Set(shopsOnScreen.map((s) => s.shopId));

    // Remove visuals for shops no longer having this staff or offscreen
    this.assignedStaffVisuals.forEach((visual, shopId) => {
      const assignedStaffId = Object.keys(store.staffAssignments || {}).find(
        (sId) => store.staffAssignments[sId] === shopId && store.staff[sId]
      );
      const isShopOnScreen = activeShopIdsOnScreen.has(shopId);

      if (!isShopOnScreen || !assignedStaffId || assignedStaffId !== visual.staffId) {
        visual.bobTween?.stop();
        visual.badgeContainer.destroy();
        visual.sprite.destroy();
        this.assignedStaffVisuals.delete(shopId);
      }
    });

    // Add or maintain visuals for current assigned staff on this screen
    shopsOnScreen.forEach((shop) => {
      const isOwned = (store.shopLevels[shop.shopId] || 0) > 0;
      if (!isOwned) return;

      const assignedStaffId = Object.keys(store.staffAssignments || {}).find(
        (sId) => store.staffAssignments[sId] === shop.shopId && store.staff[sId]
      );
      if (!assignedStaffId) return;

      const staffMember = INITIAL_STAFF.find((s) => s.id === assignedStaffId);
      if (!staffMember) return;

      const existingVisual = this.assignedStaffVisuals.get(shop.shopId);
      if (existingVisual && existingVisual.staffId === assignedStaffId) {
        return;
      }

      // Stand beside door/counter on the left (opposite of customer on the right)
      const standX = shop.doorX - 32;
      const standY = 525;

      let spriteKey = assignedStaffId;
      if (!this.textures.exists(spriteKey)) {
        spriteKey = 'staff_assistant_1';
        if (!this.textures.exists(spriteKey)) {
          spriteKey = 'player_idle';
        }
      }

      const sprite = this.add.sprite(standX, standY, spriteKey);
      sprite.setOrigin(0.5, 1);
      sprite.setScale(0.48);
      sprite.setDepth(standY);
      sprite.setFlipX(false);
      sprite.setInteractive({ useHandCursor: true });

      // Gentle breathing / idle bob tween
      const bobTween = this.tweens.add({
        targets: sprite,
        y: standY - 3,
        duration: 540 + Phaser.Math.Between(0, 180),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Name badge container above staff head
      const badgeY = standY - 96;
      const badgeContainer = this.add.container(standX, badgeY);
      badgeContainer.setDepth(standY + 25);

      const badgeBg = this.add.rectangle(0, 0, 118, 20, 0x4c1d95, 0.94)
        .setStrokeStyle(1.5, 0xa855f7);

      const badgeText = this.add.text(0, 0, `${staffMember.avatar} ${staffMember.name}`, {
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#f3e8ff',
      }).setOrigin(0.5);

      badgeContainer.add([badgeBg, badgeText]);

      // Click staff to hear greeting / status
      const handleStaffClick = () => {
        if (useGameStore.getState().activeModal) return;
        sounds.playClick();
        this.showFloatingMessage(
          standX,
          standY - 70,
          `${staffMember.avatar} ${staffMember.name}: "Chào chủ quán! Em đang chăm chỉ phục vụ khách tại ${shop.name}!"`,
        );
      };

      sprite.on('pointerdown', handleStaffClick);
      badgeBg.setInteractive({ useHandCursor: true });
      badgeBg.on('pointerdown', handleStaffClick);

      this.assignedStaffVisuals.set(shop.shopId, {
        shopId: shop.shopId,
        staffId: assignedStaffId,
        sprite,
        badgeContainer,
        bobTween,
      });
    });
  }

  private clearAllAssignedStaffVisuals() {
    this.assignedStaffVisuals.forEach((v) => {
      v.bobTween?.stop();
      v.badgeContainer.destroy();
      v.sprite.destroy();
    });
    this.assignedStaffVisuals.clear();
  }

  /** Navigation arrows and street plaque to switch street screens smoothly */
  private setupScreenNavigation(width: number, height: number) {
    this.screenNavGroup.clear(true, true);

    // 1. LEFT ARROW BUTTON (‹) at x: 52, y: 530
    const leftBtnBg = this.add.circle(52, 530, 40, 0x0f172a, 0.88).setStrokeStyle(3.5, 0xf59e0b).setDepth(600);
    const leftArrow = this.add.text(52, 526, '‹', {
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#fde047',
    }).setOrigin(0.5).setDepth(601);

    leftBtnBg.setInteractive({ useHandCursor: true });
    leftArrow.setInteractive({ useHandCursor: true });

    const handleLeftClick = () => {
      if (useGameStore.getState().activeModal) return;
      const prevScreen = this.currentStreetScreen > 1 ? this.currentStreetScreen - 1 : 9;
      this.switchStreetScreen(prevScreen);
    };
    leftBtnBg.on('pointerdown', handleLeftClick);
    leftArrow.on('pointerdown', handleLeftClick);

    // Hover effect
    leftBtnBg.on('pointerover', () => {
      leftBtnBg.setFillStyle(0xea580c, 0.95);
      leftArrow.setScale(1.15);
    });
    leftBtnBg.on('pointerout', () => {
      leftBtnBg.setFillStyle(0x0f172a, 0.88);
      leftArrow.setScale(1.0);
    });

    // 2. RIGHT ARROW BUTTON (›) at x: width - 52, y: 530
    const rightBtnBg = this.add.circle(width - 52, 530, 40, 0x0f172a, 0.88).setStrokeStyle(3.5, 0xf59e0b).setDepth(600);
    const rightArrow = this.add.text(width - 52, 526, '›', {
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#fde047',
    }).setOrigin(0.5).setDepth(601);

    rightBtnBg.setInteractive({ useHandCursor: true });
    rightArrow.setInteractive({ useHandCursor: true });

    const handleRightClick = () => {
      if (useGameStore.getState().activeModal) return;
      const nextScreen = this.currentStreetScreen < 9 ? this.currentStreetScreen + 1 : 1;
      this.switchStreetScreen(nextScreen);
    };
    rightBtnBg.on('pointerdown', handleRightClick);
    rightArrow.on('pointerdown', handleRightClick);

    rightBtnBg.on('pointerover', () => {
      rightBtnBg.setFillStyle(0xea580c, 0.95);
      rightArrow.setScale(1.15);
    });
    rightBtnBg.on('pointerout', () => {
      rightBtnBg.setFillStyle(0x0f172a, 0.88);
      rightArrow.setScale(1.0);
    });

    // 3. VIETNAMESE STREET SIGN POST ON SIDEWALK CURB (x: 200, y: 900)
    const signX = 200;
    const signY = 900;

    const signPostSprite = this.add.sprite(signX, signY, 'prop_street_sign_post')
      .setOrigin(0.5, 270 / 280)
      .setDepth(signY);
    signPostSprite.setInteractive({ useHandCursor: true });
    signPostSprite.on('pointerdown', handleRightClick);

    // Hover effect on sign post
    signPostSprite.on('pointerover', () => {
      signPostSprite.setTint(0xffedd5);
      this.tweens.add({
        targets: [signPostSprite, this.streetSignSubText, this.streetSignMainText],
        scaleX: 1.03,
        scaleY: 1.03,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });
    signPostSprite.on('pointerout', () => {
      signPostSprite.clearTint();
      this.tweens.add({
        targets: [signPostSprite, this.streetSignSubText, this.streetSignMainText],
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 120,
        ease: 'Quad.easeOut',
      });
    });

    // Subtitle inside ribbon pill on the sign plate
    this.streetSignSubText = this.add.text(signX, signY - 207, `‹  PHỐ ${this.currentStreetScreen}/9  ›`, {
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#fde047',
    }).setOrigin(0.5).setDepth(signY + 1);
    this.streetSignSubText.setInteractive({ useHandCursor: true });
    this.streetSignSubText.on('pointerdown', handleRightClick);

    // Main Street Name text on sign plate
    const initialLoc = LOCATIONS[this.currentStreetScreen - 1] || LOCATIONS[0];
    const initialName = initialLoc.name.replace(/^\d+[\.\:\-\s]+/, '').toUpperCase();

    this.streetSignMainText = this.add.text(signX, signY - 168, initialName, {
      fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#082f49',
      strokeThickness: 2.5,
      align: 'center',
    }).setOrigin(0.5).setDepth(signY + 1);
    this.streetSignMainText.setInteractive({ useHandCursor: true });
    this.streetSignMainText.on('pointerdown', handleRightClick);

    // Cart Location indicator badge on sign post
    this.streetSignCartBadgeBg = this.add.rectangle(signX, signY - 128, 154, 24, 0x064e3b, 0.92)
      .setStrokeStyle(1.5, 0x10b981)
      .setDepth(signY + 1);
    this.streetSignCartBadgeText = this.add.text(signX, signY - 128, '📍 Xe Hàng Tại Đây', {
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#34d399',
    }).setOrigin(0.5).setDepth(signY + 2);

    this.streetSignCartBadgeBg.setInteractive({ useHandCursor: true });
    this.streetSignCartBadgeText.setInteractive({ useHandCursor: true });

    const handleCartBadgeClick = () => {
      if (useGameStore.getState().activeModal) return;
      const targetLoc = LOCATIONS[this.currentStreetScreen - 1] || LOCATIONS[0];
      const storeState = useGameStore.getState();
      const cartScreen = LOCATIONS.findIndex((l) => l.id === storeState.currentLocationId) + 1;
      const isCartHere = this.currentStreetScreen === (cartScreen > 0 ? cartScreen : 1);

      if (!isCartHere) {
        sounds.playClick();
        const success = storeState.travelToLocation(targetLoc.id);
        if (success) {
          this.switchStreetScreen(this.currentStreetScreen);
        }
      }
    };
    this.streetSignCartBadgeBg.on('pointerdown', handleCartBadgeClick);
    this.streetSignCartBadgeText.on('pointerdown', handleCartBadgeClick);

    // Quick Jump back to Cart button (visible only when on other screens)
    this.streetSignReturnBtn = this.add.text(signX, signY - 100, '↩ Về Xe Hàng', {
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#38bdf8',
      backgroundColor: '#0f172ae0',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5).setDepth(signY + 2).setVisible(false);
    this.streetSignReturnBtn.setInteractive({ useHandCursor: true });
    this.streetSignReturnBtn.on('pointerdown', () => {
      if (useGameStore.getState().activeModal) return;
      sounds.playClick();
      const storeState = useGameStore.getState();
      const cartScreen = LOCATIONS.findIndex((l) => l.id === storeState.currentLocationId) + 1;
      this.switchStreetScreen(cartScreen > 0 ? cartScreen : 1);
    });

    this.screenNavGroup.addMultiple([
      leftBtnBg,
      leftArrow,
      rightBtnBg,
      rightArrow,
      signPostSprite,
      this.streetSignSubText,
      this.streetSignMainText,
      this.streetSignCartBadgeBg,
      this.streetSignCartBadgeText,
      this.streetSignReturnBtn,
    ]);
  }

  /** Switches street screens smoothly with a subtle transition */
  private switchStreetScreen(targetScreen: number) {
    if (this.currentStreetScreen === targetScreen) return;
    this.currentStreetScreen = targetScreen;
    sounds.playClick();

    this.tweens.add({
      targets: this.bgImage,
      alpha: 0.2,
      duration: 140,
      yoyo: true,
      onYoyo: () => {
        this.bgImage.setTexture(`background_street_${this.currentStreetScreen}`);

        const storeState = useGameStore.getState();
        const cartScreen = LOCATIONS.findIndex((l) => l.id === storeState.currentLocationId) + 1;
        const isCartOnThisScreen = this.currentStreetScreen === (cartScreen > 0 ? cartScreen : 1);

        const cartLoc = LOCATION_MAP[storeState.currentLocationId] || LOCATION_MAP['sidewalk_start'];
        const cartX = cartLoc.cartLayout.x;
        const cartY = cartLoc.cartLayout.y;
        const cartScale = cartLoc.cartLayout.scale || 0.85;

        this.currentCartTier = storeState.cartTier || 1;
        const cartKey = this.textures.exists(`cart_tier_${this.currentCartTier}`)
          ? `cart_tier_${this.currentCartTier}`
          : 'cart_tier_1';
        this.cartSprite.setTexture(cartKey);
        this.cartSprite.setPosition(cartX, cartY).setVisible(isCartOnThisScreen);
        this.cartSprite.setScale(cartScale);
        this.cartSprite.setDepth(cartY);
        this.cartSignSprite.setPosition(cartX + 104, cartY - 96).setDepth(cartY + 1).setVisible(isCartOnThisScreen);
        this.cartEquipmentSprite.setPosition(cartX - 36, cartY + 14).setDepth(cartY + 3).setVisible(isCartOnThisScreen);
        this.steamEmitter.setPosition(cartX - 20, cartY - 50);
        if (isCartOnThisScreen) {
          this.steamEmitter.start();
        } else {
          this.steamEmitter.stop();
        }

        this.clearAllShopCustomerVisuals();
        this.clearAllAssignedStaffVisuals();
        this.rebuildStreetShops();
        this.rebuildMapProps();
        this.updateScreenNavLabel();
        this.updateShopCustomerVisuals();
        this.updateAssignedStaffVisuals();
        this.updateCustomerEntities(0.016);
      },
    });
  }

  private updateScreenNavLabel() {
    if (!this.streetSignMainText || !this.streetSignSubText) return;
    const targetLoc = LOCATIONS[this.currentStreetScreen - 1] || LOCATIONS[0];
    const cleanName = targetLoc.name.replace(/^\d+[\.\:\-\s]+/, '').toUpperCase();
    this.streetSignSubText.setText(`‹  PHỐ ${this.currentStreetScreen}/9  ›`);
    this.streetSignMainText.setText(cleanName);
    if (cleanName.length > 20) {
      this.streetSignMainText.setFontSize('14px');
    } else if (cleanName.length > 15) {
      this.streetSignMainText.setFontSize('16px');
    } else {
      this.streetSignMainText.setFontSize('18px');
    }

    const storeState = useGameStore.getState();
    const cartScreen = LOCATIONS.findIndex((l) => l.id === storeState.currentLocationId) + 1;
    const isCartHere = this.currentStreetScreen === (cartScreen > 0 ? cartScreen : 1);

    if (this.streetSignCartBadgeBg && this.streetSignCartBadgeText) {
      if (isCartHere) {
        this.streetSignCartBadgeBg.setFillStyle(0x064e3b, 0.92).setStrokeStyle(1.5, 0x10b981);
        this.streetSignCartBadgeText.setColor('#34d399').setText('📍 Xe Hàng Tại Đây');
        if (this.streetSignReturnBtn) this.streetSignReturnBtn.setVisible(false);
      } else {
        const isUnlocked = storeState.unlockedLocations.includes(targetLoc.id) || targetLoc.unlockCost === 0;
        this.streetSignCartBadgeBg.setFillStyle(0x0f172a, 0.92).setStrokeStyle(1.5, 0xf59e0b);
        this.streetSignCartBadgeText.setColor('#fde047').setText(isUnlocked ? '🚚 Chuyển Xe Đến Đây' : '🔒 Đổi Điểm Bán');
        if (this.streetSignReturnBtn) {
          this.streetSignReturnBtn.setText(`↩ Về Xe Hàng (Phố ${cartScreen > 0 ? cartScreen : 1})`).setVisible(true);
        }
      }
    }
  }

  private createRainEffect() {
    const width = this.scale.width;
    const particles = this.add.particles(0, 0, 'rain_drop', {
      lifespan: 800,
      speedY: { min: 450, max: 650 },
      speedX: { min: -60, max: -30 },
      scale: 1,
      quantity: 4,
      frequency: 40,
      x: { min: -50, max: width + 50 },
      y: -10,
    });
    particles.setDepth(900);
    particles.stop();
    this.rainEmitter = particles;
  }

  private spawnPassingScooter() {
    // Strictly on the roadway below sidewalk curb (y: 950 to 990)
    const yPos = Phaser.Math.Between(950, 990);
    const scooter = this.add.sprite(-120, yPos, 'scooter_bike');
    scooter.setScale(1.7);
    scooter.setDepth(yPos);
    this.scooterGroup.add(scooter);

    this.tweens.add({
      targets: scooter,
      x: this.scale.width + 120,
      duration: 3200,
      ease: 'Linear',
      onComplete: () => {
        scooter.destroy();
      },
    });
  }

  update(time: number, delta: number) {
    const deltaSeconds = delta / 1000;
    const store = useGameStore.getState();

    // 1. Tick Store Simulation
    store.tick(deltaSeconds);

    // 2. Check Dynamic Location Change
    if (this.currentLocationId !== store.currentLocationId) {
      const activeLoc = LOCATION_MAP[store.currentLocationId];
      if (activeLoc && activeLoc.requiredLevel > store.level) {
        useGameStore.setState({ currentLocationId: 'sidewalk_start' });
        this.currentLocationId = 'sidewalk_start';
        this.currentStreetScreen = 1;
        this.handleLocationChanged();
      } else {
        this.currentLocationId = store.currentLocationId;
        this.handleLocationChanged();
      }
    }

    // 3. Check Dynamic Cart Tier Upgrade
    if (store.cartTier && store.cartTier !== this.currentCartTier) {
      this.currentCartTier = store.cartTier;
      this.handleCartUpgraded();
    }

    // 4. Balanced Customer Spawning Timer (calm street pace)
    this.spawnTimer += deltaSeconds;
    if (this.spawnTimer >= 14.0) {
      this.spawnTimer = 0;
      if (store.orders.length < store.maxOrdersQueue) {
        store.spawnCustomerOrder();
      }
    }

    // 5. Handle Player Movement with natural animation
    this.updatePlayerMovement(deltaSeconds);
    this.updateSidewalkWalkers(deltaSeconds);

    // 6. Update Customers Visuals along the Walk Zone
    this.updateCustomerEntities(deltaSeconds);

    // 7. Update Weather & Lighting Tints
    this.updateEnvironmentVisuals();
  }

  private handleLocationChanged() {
    const locIndex = LOCATIONS.findIndex((l) => l.id === this.currentLocationId);
    if (locIndex >= 0 && this.currentStreetScreen !== locIndex + 1) {
      this.currentStreetScreen = locIndex + 1;
    }
    const loc = LOCATION_MAP[this.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    this.bgImage.setTexture(`background_street_${this.currentStreetScreen}`);

    // Relocate cart & steam emitter
    const cartX = loc.cartLayout.x;
    const cartY = loc.cartLayout.y;
    const cartScale = loc.cartLayout.scale || 0.85;

    this.cartSprite.setPosition(cartX, cartY);
    this.cartSprite.setScale(cartScale);
    this.cartSprite.setDepth(cartY);
    this.cartSignSprite.setPosition(cartX + 104, cartY - 96).setDepth(cartY + 1);
    this.cartEquipmentSprite.setPosition(cartX - 36, cartY + 14).setDepth(cartY + 3);

    this.steamEmitter.setPosition(cartX - 20, cartY - 50);
    this.steamEmitter.setDepth(cartY + 2);

    // Relocate player
    this.player.setPosition(cartX - 90, cartY + 30);
    this.player.setDepth(cartY + 30);

    // Rebuild tables and shops for balanced layout
    this.clearAllShopCustomerVisuals();
    this.clearAllAssignedStaffVisuals();
    this.rebuildTablesAndStools();
    this.rebuildStreetShops();
    this.rebuildMapProps();
    this.updateScreenNavLabel();
    this.updateShopCustomerVisuals();
    this.updateAssignedStaffVisuals();
    this.showFloatingMessage(this.scale.width / 2, 450, `📍 Đã chuyển đến: ${loc.name}`);
  }

  private rebuildMapProps() {
    this.mapPropGroup.clear(true, true);
    const loc = LOCATION_MAP[this.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    const props = loc.mapProps || [];

    props.forEach((p) => {
      if (!this.textures.exists(p.assetKey)) return;
      const sprite = this.add.sprite(p.x, p.y, p.assetKey);
      sprite.setOrigin(0.5, 1);
      sprite.setScale(p.scale || 1);
      sprite.setDepth(p.y);

      if (p.interactive) {
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', () => {
          if (useGameStore.getState().activeModal) return;
          sounds.playClick();
          this.showFloatingMessage(p.x, p.y - 60, p.dialogue || `📍 ${p.name || loc.name}`);
        });
      }

      this.mapPropGroup.add(sprite);
    });

    this.mapPropGroup.setVisible(true);
  }

  private handleCartUpgraded() {
    const store = useGameStore.getState();
    this.currentCartTier = store.cartTier || 1;
    const key = this.textures.exists(`cart_tier_${this.currentCartTier}`)
      ? `cart_tier_${this.currentCartTier}`
      : 'cart_tier_1';
    const signKey = `cart_sign_tier_${this.currentCartTier}`;
    const equipmentKey = `cart_equipment_tier_${this.currentCartTier}`;

    const location = LOCATION_MAP[this.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    const cartScale = location.cartLayout.scale || 0.85;

    const currentLocIndex = LOCATIONS.findIndex((l) => l.id === this.currentLocationId);
    const targetScreen = currentLocIndex >= 0 ? currentLocIndex + 1 : 1;
    if (this.currentStreetScreen !== targetScreen) this.switchStreetScreen(targetScreen);

    if (this.cartSprite) {
      this.cartSprite.setVisible(true).setTexture(key).setScale(cartScale);
      this.cartSprite.setDepth(this.cartSprite.y);
    }
    if (this.cartSignSprite) {
      const validSignKey = this.textures.exists(signKey) ? signKey : 'cart_sign_tier_1';
      this.cartSignSprite.setVisible(true).setTexture(validSignKey);
      this.cartSignSprite.setDepth(this.cartSprite ? this.cartSprite.y + 1 : 100);
    }
    if (this.cartEquipmentSprite) {
      const validEquipKey = this.textures.exists(equipmentKey) ? equipmentKey : 'cart_equipment_tier_1';
      this.cartEquipmentSprite.setVisible(true).setTexture(validEquipKey);
      this.cartEquipmentSprite.setDepth(this.cartSprite ? this.cartSprite.y + 3 : 100);
    }
    if (this.cartSprite) {
      this.showFloatingMessage(this.cartSprite.x, this.cartSprite.y - 220, `🚚 Đang dùng xe cấp ${this.currentCartTier}!`);
    }
  }

  private updatePlayerMovement(deltaSeconds: number) {
    const store = useGameStore.getState();
    if (store.activeModal) {
      this.playerTargetX = null;
      this.playerTargetY = null;
      return;
    }
    const loc = LOCATION_MAP[store.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    const zone = loc.walkZone;

    let vx = 0;
    let vy = 0;
    const speed = 270;

    if (this.cursors && this.wasdKeys) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) vx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) vx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) vy -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) vy += 1;

      if (
        Phaser.Input.Keyboard.JustDown(this.wasdKeys.E) ||
        Phaser.Input.Keyboard.JustDown(this.wasdKeys.SPACE)
      ) {
        this.handlePlayerInteract();
      }
    }

    // Pointer target movement
    if (this.playerTargetX !== null && this.playerTargetY !== null) {
      const dx = this.playerTargetX - this.player.x;
      const dy = this.playerTargetY - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        vx = dx / dist;
        vy = dy / dist;
      } else {
        this.playerTargetX = null;
        this.playerTargetY = null;
      }
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    const isMoving = vx !== 0 || vy !== 0;

    // Movement & natural walking bobbing with constant character model and size
    if (isMoving) {
      this.player.x = Phaser.Math.Clamp(this.player.x + vx * speed * deltaSeconds, zone.minX, zone.maxX);
      this.player.y = Phaser.Math.Clamp(this.player.y + vy * speed * deltaSeconds, zone.minY, zone.maxY);

      this.walkBobTimer += deltaSeconds * 14;
      this.player.y += Math.sin(this.walkBobTimer) * 1.5;
      this.player.setAngle(Math.sin(this.walkBobTimer) * 3.5);

      if (vx < 0) this.player.setFlipX(true);
      else if (vx > 0) this.player.setFlipX(false);
    } else {
      this.player.setAngle(0);
    }

    // Always keep player texture and scale 100% consistent (never shrink or morph)
    if (this.textures.exists('player_idle') && this.player.texture.key !== 'player_idle') {
      this.player.setTexture('player_idle');
    }
    this.player.setScale(0.75);
    this.player.setDepth(this.player.y);
  }

  private handlePlayerInteract() {
    const store = useGameStore.getState();
    const distToCart = Math.hypot(this.player.x - this.cartSprite.x, this.player.y - this.cartSprite.y);
    if (distToCart < 170) {
      store.openCookingStation();
      return;
    }

    let nearestCust: CustomerVisual | null = null;
    let nearestDist = 180;
    this.customerVisuals.forEach((cv) => {
      const dist = Math.hypot(this.player.x - cv.sprite.x, this.player.y - cv.sprite.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCust = cv;
      }
    });

    if (nearestCust) {
      const order = store.orders.find((o) => o.id === (nearestCust as CustomerVisual).orderId);
      if (order) {
        if (order.status === 'READY') {
          store.serveOrder(order.id);
        } else {
          store.openCookingStation(order.items[0]?.recipeId);
        }
      }
    }
  }

  private updateCustomerEntities(deltaSeconds: number) {
    const store = useGameStore.getState();
    const loc = LOCATION_MAP[store.currentLocationId] || LOCATION_MAP['sidewalk_start'];
    const cartScreen = LOCATIONS.findIndex((l) => l.id === store.currentLocationId) + 1;
    const isCartOnScreen = this.currentStreetScreen === (cartScreen > 0 ? cartScreen : 1);
    const currentOrders = store.orders;
    const activeOrderIds = new Set(currentOrders.map((o) => o.id));

    // Remove visuals for finished or departed orders
    this.customerVisuals.forEach((cv, orderId) => {
      if (!activeOrderIds.has(orderId)) {
        this.tweens.add({
          targets: [cv.sprite, cv.bubbleContainer],
          x: cv.sprite.x + (cv.sprite.x > 400 ? 160 : -160),
          alpha: 0,
          duration: 900,
          onComplete: () => {
            cv.sprite.destroy();
            cv.bubbleContainer.destroy();
          },
        });
        this.customerVisuals.delete(orderId);
      }
    });

    // Create or update customer entities
    currentOrders.forEach((order, index) => {
      let cv = this.customerVisuals.get(order.id);
      const recipe = RECIPE_MAP[order.items[0]?.recipeId || 'banh_mi_thit'];

      if (!cv) {
        // Tidy queue position in front of cart along sidewalk (1600x1040 HD)
        const targetX = loc.queueStart.x - index * 118;
        const targetY = loc.queueStart.y;

        const startX = targetX < 800 ? -40 : this.scale.width + 40;

        // Pick matching chibi customer sprite
        let spriteKey = `cust_${order.customerTypeId}`;
        if (!this.textures.exists(spriteKey)) {
          spriteKey = 'player_idle';
        }

        const sprite = this.add.sprite(startX, targetY, spriteKey);
        sprite.setOrigin(0.5, 1);
        sprite.setScale(0.72); // clean HD 128x160 chibi proportions grounded firmly on pavement
        sprite.setInteractive({ useHandCursor: true });

        if (!isCartOnScreen) {
          sprite.setVisible(false);
        }

        // Walking bob tween
        this.tweens.add({
          targets: sprite,
          y: targetY - 5,
          duration: 380,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        // Speech bubble container (HD 2x)
        const bubbleContainer = this.add.container(startX, targetY - 130);
        const bubbleBg = this.add.sprite(0, 0, 'speech_bubble');
        bubbleBg.setScale(1.0);

        const bubbleIcon = this.add.text(0, -10, recipe?.icon || '🥖', {
          fontSize: '32px',
        });
        bubbleIcon.setOrigin(0.5);

        // Patience Mini Bar
        const patienceBarBg = this.add.rectangle(0, 16, 56, 7, 0x334155);
        const patienceBarFill = this.add.rectangle(-28, 16, 56, 7, 0x22c55e);
        patienceBarFill.setOrigin(0, 0.5);

        // Green Exclamation Mark `!` floating above customer
        const exclamationIcon = this.add.text(32, -42, '!', {
          fontFamily: 'sans-serif',
          fontSize: '28px',
          color: '#22c55e',
          fontStyle: 'bold',
          stroke: '#14532d',
          strokeThickness: 4,
        });

        bubbleContainer.add([bubbleBg, bubbleIcon, patienceBarBg, patienceBarFill, exclamationIcon]);
        if (!isCartOnScreen) {
          bubbleContainer.setVisible(false);
        }

        // Customer click interaction
        sprite.on('pointerdown', () => {
          if (useGameStore.getState().activeModal) return;
          if (order.status === 'READY') {
            this.showFloatingCoin(cv!.sprite.x, cv!.sprite.y - 130, `+${order.totalPrice.toLocaleString('vi-VN')}đ`);
            store.serveOrder(order.id);
          } else {
            store.openCookingStation(order.items[0]?.recipeId);
          }
        });

        cv = {
          id: order.customerId,
          orderId: order.id,
          sprite,
          bubbleContainer,
          bubbleIcon,
          patienceBarBg,
          patienceBarFill,
          exclamationIcon,
          targetX,
          targetY,
          isAtDestination: false,
          tableIndex: order.tableIndex,
        };

        this.customerVisuals.set(order.id, cv);
      }

      // Smooth natural movement towards destination
      if (!cv.isAtDestination) {
        const dx = cv.targetX - cv.sprite.x;
        const dist = Math.abs(dx);
        if (dist > 5) {
          const step = Math.sign(dx) * 170 * deltaSeconds;
          cv.sprite.x += step;
          cv.bubbleContainer.x = cv.sprite.x;
          cv.bubbleContainer.y = cv.sprite.y - 130;
          cv.sprite.setFlipX(dx < 0);
        } else {
          cv.sprite.x = cv.targetX;
          cv.bubbleContainer.x = cv.targetX;
          cv.bubbleContainer.y = cv.sprite.y - 130;
          cv.isAtDestination = true;
          if (cv.exclamationIcon) {
            cv.exclamationIcon.setVisible(false);
          }
        }
      }

      cv.sprite.setVisible(isCartOnScreen);
      cv.bubbleContainer.setVisible(isCartOnScreen);
      cv.sprite.setDepth(cv.sprite.y);
      cv.bubbleContainer.setDepth(cv.sprite.y + 20);

      // Update patience bar & status badge
      const waitRatio = Math.max(0, Math.min(1, order.remainingSeconds / order.maxWaitSeconds));
      cv.patienceBarFill.width = 56 * waitRatio;

      if (waitRatio < 0.3) {
        cv.patienceBarFill.setFillStyle(0xef4444);
      } else if (waitRatio < 0.6) {
        cv.patienceBarFill.setFillStyle(0xf59e0b);
      } else {
        cv.patienceBarFill.setFillStyle(0x22c55e);
      }

      if (order.status === 'READY') {
        cv.bubbleIcon.setText('⭐');
        cv.patienceBarFill.setFillStyle(0x10b981);
      } else {
        cv.bubbleIcon.setText(waitRatio < 0.3 ? '⏳' : recipe?.icon || '🍲');
      }
    });
  }

  private showFloatingCoin(x: number, y: number, text: string) {
    const floatingText = this.add.text(x, y, text, {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#4ade80',
      fontStyle: 'bold',
      stroke: '#052e16',
      strokeThickness: 4,
    });
    floatingText.setOrigin(0.5);
    floatingText.setDepth(1500);

    this.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        floatingText.destroy();
      },
    });
  }

  private showFloatingMessage(x: number, y: number, text: string) {
    const floatingText = this.add.text(x, y, text, {
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#0f172a',
      strokeThickness: 4,
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
    });
    floatingText.setOrigin(0.5);
    floatingText.setDepth(2000);

    this.tweens.add({
      targets: floatingText,
      y: y - 45,
      alpha: 0,
      duration: 2200,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        floatingText.destroy();
      },
    });
  }

  private updateEnvironmentVisuals() {
    const store = useGameStore.getState();

    // Rain effect toggle
    if (this.rainEmitter) {
      if (store.weather === 'RAIN' && !this.isRaining) {
        this.rainEmitter.start();
        this.isRaining = true;
      } else if (store.weather !== 'RAIN' && this.isRaining) {
        this.rainEmitter.stop();
        this.isRaining = false;
      }
    }

    // Day / Night Lighting Tints
    if (this.lightOverlay) {
      switch (store.timeOfDay) {
        case 'DAWN':
          this.lightOverlay.setFillStyle(0xffa254, 0.12);
          break;
        case 'MORNING':
          this.lightOverlay.setFillStyle(0xffffff, 0);
          break;
        case 'NOON':
          this.lightOverlay.setFillStyle(0xfde047, 0.06);
          break;
        case 'AFTERNOON':
          this.lightOverlay.setFillStyle(0xf97316, 0.18);
          break;
        case 'EVENING':
          this.lightOverlay.setFillStyle(0x0f172a, 0.48);
          break;
      }
    }
  }
}
