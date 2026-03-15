import type { Challenge, ChallengeProvider, ChallengeOptions } from './types.ts';

// Vyjmenovaná slova + their derived forms (declensions, prefixes)
// AND commonly mistaken i-words (traps where students write y but it should be i)
// Each entry: [word_with_blank, correct_answer]
// Answer is always just 'y' or 'i' (normalized in engine to match ý/í too)

type WordEntry = [string, 'y' | 'i'];

const WORDS_BY_LETTER: Record<string, WordEntry[]> = {
  B: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['b_t (existovat)', 'y'], ['b_dlit', 'y'], ['b_dlení', 'y'], ['b_dliště', 'y'],
    ['ob_čej', 'y'], ['ob_čejný', 'y'], ['b_k', 'y'], ['b_lina', 'y'],
    ['b_ložravec', 'y'], ['kob_la', 'y'], ['kob_lka', 'y'], ['b_strý', 'y'],
    ['b_strost', 'y'], ['b_střina', 'y'], ['dob_tek', 'y'], ['dob_tčí', 'y'], 
    ['ob_vatel', 'y'], ['ob_vatelstvo', 'y'], ['zb_tek', 'y'], ['zb_tečný', 'y'], 
    ['ob_dlí', 'y'], ['příb_tek', 'y'], ['nab_t (znalosti/majetek)', 'y'], 
    ['dob_t (hrad/území)', 'y'], ['odb_t (flákat práci)', 'y'], ['zb_t (zůstat)', 'y'], 
    ['b_lý (plevel)', 'y'], ['starob_lý', 'y'], ['živob_tí', 'y'], ['b_tný', 'y'],
    ['b_valý', 'y'], ['nedob_tný (hrad)', 'y'], ['B_džov', 'y'], ['Přib_slav', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['b_t (udeřit)', 'i'], ['nab_t (baterii/zbraň)', 'i'], ['dob_t (kredit/baterii)', 'i'],
    ['odb_t (hodiny)', 'i'], ['zb_t (zmlátit)', 'i'], ['rozb_t (okno)', 'i'], 
    ['přib_t (hřebík do zdi)', 'i'], ['b_lý (barva)', 'i'], ['b_lit (na bílo)', 'i'],
    ['b_da', 'i'], ['b_č', 'i'], ['b_čík', 'i'], ['b_lek (ve vejci)', 'i'], 
    ['b_lkovina', 'i'], ['zab_t', 'i'], ['b_tva', 'i'], ['b_stro', 'i'], 
    ['b_dlo (dlouhá tyč)', 'i'], ['ob_hat (kolem dokola)', 'i'], ['nab_dka', 'i'],
  ],
  L: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['sl_šet', 'y'], ['nedosl_chavý', 'y'], ['ml_n', 'y'], ['ml_nář', 'y'], 
    ['bl_skat se', 'y'], ['zabl_sknout se', 'y'], ['bl_skavý', 'y'], ['pol_kat', 'y'], 
    ['pol_kač', 'y'], ['pl_n', 'y'], ['pl_nový', 'y'], ['pl_nout', 'y'], 
    ['pl_tvat', 'y'], ['vzl_kat', 'y'], ['l_ko', 'y'], ['l_kožrout', 'y'], 
    ['l_že (sportovní potřeba)', 'y'], ['l_žař', 'y'], ['l_sý (plešatý)', 'y'], 
    ['l_sina', 'y'], ['pl_š', 'y'], ['pl_tký', 'y'], ['osl_šet (přeslechnout)', 'y'], 
    ['spl_vat', 'y'], ['pel_něk', 'y'], ['l_ska (vodní pták)', 'y'], ['l_tko', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['l_pa', 'i'], ['l_stek', 'i'], ['l_stí', 'i'], ['vl_v', 'i'],
    ['l_ný', 'i'], ['l_nout (vůně)', 'i'], ['l_že (zmrzlinu)', 'i'], 
    ['pl_vat (sliny)', 'i'], ['l_ška', 'i'], ['l_šák', 'i'], ['l_d', 'i'], 
    ['l_tost', 'i'], ['l_s (stroj na lisování)', 'i'], ['l_zátko', 'i'], 
    ['sl_bovat', 'i'], ['pel_kán', 'i'], ['l_ska (keř s oříšky)', 'i'], 
    ['obl_čej', 'i'], ['mal_na', 'i'], ['l_šej', 'i'], ['pl_seň', 'i'],
  ],
  M: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['m_t (čistit vodou)', 'y'], ['um_vat', 'y'], ['m_val', 'y'], ['m_dlo', 'y'], 
    ['m_dlinky', 'y'], ['m_š', 'y'], ['hm_z', 'y'], ['hm_zožravec', 'y'], 
    ['m_slet', 'y'], ['m_šlenka', 'y'], ['sm_sl', 'y'], ['nesm_sl', 'y'], 
    ['dom_šlivý', 'y'], ['m_lit se', 'y'], ['zm_lka', 'y'], ['om_l', 'y'], 
    ['m_lný', 'y'], ['prům_sl', 'y'], ['zam_kat', 'y'], ['vym_kat se', 'y'], 
    ['odm_kat', 'y'], ['sm_čec', 'y'], ['sm_kat', 'y'], ['sm_k', 'y'], 
    ['přem_šlet', 'y'], ['m_tina (paseka)', 'y'], ['vym_tit (les)', 'y'], 
    ['hlem_žď', 'y'], ['chm_ří', 'y'], ['nachm_řený', 'y'], ['dm_chadlo', 'y'], 
    ['nachom_tnout se', 'y'], ['Litom_šl', 'y'], ['m_kat (česat vlnu)', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['m_t (vlastnit/mít rád)', 'i'], ['m_rný', 'i'], ['m_rumilovný', 'i'], 
    ['m_sto', 'i'], ['m_ček', 'i'], ['m_ra', 'i'], ['m_nuta', 'i'], 
    ['m_lost', 'i'], ['m_str', 'i'], ['m_za (stromu)', 'i'], ['zam_řit', 'i'], 
    ['sm_ch', 'i'], ['m_lý (příjemný)', 'i'], ['om_tka', 'i'], ['zm_je', 'i'], 
    ['m_hat se', 'i'], ['m_hotat', 'i'], ['m_minko', 'i'], ['zm_zet', 'i'], 
    ['m_hnout se', 'i'], ['m_šmaš', 'i'],
  ],
  P: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['p_cha', 'y'], ['p_šný', 'y'], ['p_šnit se', 'y'], ['p_tel', 'y'], 
    ['p_tlovina', 'y'], ['p_tlák', 'y'], ['p_sk', 'y'], ['netop_r', 'y'], 
    ['slep_š', 'y'], ['p_l (z květin)', 'y'], ['p_lové (zrnko)', 'y'], 
    ['kop_to', 'y'], ['sudokop_tník', 'y'], ['klop_tat', 'y'], ['p_kat (trpět za vinu)', 'y'], 
    ['odp_kat si', 'y'], ['p_r (plevel)', 'y'], ['p_řit se (červenat se)', 'y'], 
    ['čep_řit se', 'y'], ['třp_t', 'y'], ['třp_tka', 'y'], ['třp_tit se', 'y'], 
    ['zp_tovat (svědomí)', 'y'], ['jazykozp_t', 'y'], ['p_skovat (odmlouvat)', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['p_l (nápoj)', 'i'], ['op_lý', 'i'], ['p_lný (pracovitý)', 'i'], ['p_le', 'i'], 
    ['p_la (nástroj)', 'i'], ['op_lovat (nehty)', 'i'], ['p_smo', 'i'], 
    ['p_vo', 'i'], ['op_ce', 'i'], ['čep_ce', 'i'], ['p_skovat (pískem)', 'i'], 
    ['p_štět', 'i'], ['p_škot', 'i'], ['p_javice', 'i'], ['p_kolo', 'i'], 
    ['p_lulka (prášek)', 'i'], ['p_lka (malá pila)', 'i'], ['p_nzeta', 'i'], 
    ['p_ha', 'i'], ['p_hovatý', 'i'], ['p_chlavý', 'i'], ['sp_lat (nadávat)', 'i'], 
    ['p_kat (ve hře na schovávanou)', 'i'], ['krop_tko', 'i'], ['p_skat (na prsty)', 'i'],
  ],
  S: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['s_n', 'y'], ['s_novec', 'y'], ['s_tý (najedený)', 'y'], ['s_tost', 'y'], 
    ['nas_tit', 'y'], ['s_r', 'y'], ['s_reček', 'y'], ['s_rovátka', 'y'], 
    ['s_rový (maso)', 'y'], ['s_pat', 'y'], ['nas_pat', 'y'], 
    ['přes_pací', 'y'], ['s_pka', 'y'], ['s_pký', 'y'], ['s_sel', 'y'], 
    ['s_kora', 'y'], ['s_ček', 'y'], ['s_chravý', 'y'], ['us_chat', 'y'], 
    ['vys_chat', 'y'], ['os_pky', 'y'], ['s_čet', 'y'], ['zas_čet', 'y'], 
    ['Bos_ně', 'y'], ['s_rovinka (houba)', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['s_la (moc)', 'i'], ['s_lný', 'i'], ['s_to', 'i'], ['s_ť', 'i'], 
    ['s_tovka (taška)', 'i'], ['us_nat (spát)', 'i'], ['nos_t', 'i'], 
    ['pros_t', 'i'], ['s_rový (od síry)', 'i'], ['s_rotčinec', 'i'], 
    ['s_rup', 'i'], ['s_mfonie', 'i'], ['s_rka (zápalka)', 'i'], 
    ['s_lnice', 'i'], ['has_t', 'i'], ['s_pat (chraptět)', 'i'], 
    ['s_fon', 'i'], ['s_dlo', 'i'], ['os_řet (zůstat sám)', 'i'], 
    ['s_řičitan', 'i'], ['s_čák', 'i'],
  ],
  V: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['v_t (jako vlk)', 'y'], ['v_tí (vlků)', 'y'], ['v_skat (radostí)', 'y'], 
    ['zav_sknout', 'y'], ['zv_k', 'y'], ['zv_kat si', 'y'], ['náv_k', 'y'], 
    ['žv_kat', 'y'], ['přežv_kavec', 'y'], ['v_soký', 'y'], ['v_šina', 'y'], 
    ['v_sost', 'y'], ['v_dra', 'y'], ['v_r (pták)', 'y'], ['v_heň', 'y'], 
    ['v_žle (hubený člověk)', 'y'], ['pov_k', 'y'], ['pov_kovat', 'y'], 
    ['v_tah', 'y'], ['v_stava', 'y'], ['v_mysl', 'y'], ['v_bor', 'y'], 
    ['v_hra', 'y'], ['v_let', 'y'], ['v_straha', 'y'], ['v_borný', 'y'], 
    ['V_škov', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['v_t (věnec)', 'i'], ['zav_t (těsto)', 'i'], ['v_skat (ve vlasech)', 'i'], 
    ['v_r (ve vodě)', 'i'], ['v_dět', 'i'], ['v_no', 'i'], ['v_dle', 'i'], 
    ['v_dlička', 'i'], ['v_tat', 'i'], ['v_la', 'i'], ['v_tr', 'i'], 
    ['v_na', 'i'], ['v_nit', 'i'], ['v_nout', 'i'], ['v_klat', 'i'], 
    ['v_sutý (most)', 'i'], ['v_tězit', 'i'], ['v_těz', 'i'], ['sv_ce', 'i'], 
    ['v_tamín', 'i'], ['kv_let', 'i'], ['v_záž', 'i'], ['v_zita', 'i'],
  ],
  Z: [
    // --- Vyjmenovaná a příbuzná (y) ---
    ['brz_', 'y'], ['jaz_k', 'y'], ['jaz_ček', 'y'], ['jaz_kověda', 'y'], 
    ['jaz_kolam', 'y'], ['naz_vat', 'y'], ['vyz_vat', 'y'], ['oz_vat se', 'y'], 
    ['vyz_vatel', 'y'], ['vz_vat (bohy)', 'y'], ['přiz_vat', 'y'], ['Ruz_ně', 'y'],
    // --- Chytáky a běžná slova (i) ---
    ['z_ma', 'i'], ['z_mní', 'i'], ['z_mník', 'i'], ['z_sk', 'i'], 
    ['z_skávat', 'i'], ['z_tra', 'i'], ['z_třejší', 'i'], ['z_vat (únavou)', 'i'], 
    ['z_vnutí', 'i'], ['z_rat', 'i'], ['koz_ (patřící koze)', 'i'], ['z_dka', 'i'], 
    ['podz_m', 'i'], ['nez_štný', 'i'], ['mez_ník', 'i'], ['brz_čko (výjimka!)', 'i'], 
    ['z_p', 'i'], ['z_rkon', 'i'], ['Z_kmund', 'i'],
  ],
};

// Track recently correct Czech answers to reduce repetition
const recentlyCorrect = new Set<string>();

export function recordCzechCorrect(display: string): void {
  recentlyCorrect.add(display);
}

export function resetCzechHistory(): void {
  recentlyCorrect.clear();
}

const MAX_REROLL = 3;

export const czechProvider: ChallengeProvider = {
  id: 'czech',
  name: 'Vyjmenovaná slova',
  generate(_difficulty: number, options?: ChallengeOptions): Challenge {
    const letters = options?.czechLetters;
    const activeLetters = letters && letters.length > 0
      ? letters.filter(l => l in WORDS_BY_LETTER)
      : Object.keys(WORDS_BY_LETTER);

    const failedDisplays = options?.failedChallengeDisplays;

    let picked: WordEntry | undefined;
    for (let attempt = 0; attempt <= MAX_REROLL; attempt++) {
      const letter = activeLetters[Math.floor(Math.random() * activeLetters.length)];
      const words = WORDS_BY_LETTER[letter];
      picked = words[Math.floor(Math.random() * words.length)];

      const [display] = picked;
      // If already correctly answered and NOT in failed list, try to re-roll
      if (recentlyCorrect.has(display) && !(failedDisplays?.has(display)) && attempt < MAX_REROLL) {
        continue;
      }
      break;
    }

    const [display, answer] = picked!;

    return {
      display,
      answer,
      inputType: 'text',
    };
  },
};
