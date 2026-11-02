const $ = id => document.getElementById(id);
const form = $("planner-form");
const toast = $("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}
$("leave").addEventListener("change", () => {
  $("leave-time-wrap").classList.toggle("hidden", $("leave").value !== "指定時刻がある");
});

function val(id, fallback="未指定") {
  const value = $(id).value.trim();
  return value || fallback;
}
function checkedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value);
}
function makePrompt() {
  const interests = checkedValues("interests");
  const park = val("park");
  const date = val("visitDate", "未定");
  const leaveTime = $("leave").value === "指定時刻がある" ? `（希望：${val("leaveTime")}）` : "";
  const mustDo = val("mustDo", "特になし");
  const avoid = val("avoid", "特になし");
  const companions = val("companions", "特になし");
  const notes = val("notes", "特になし");
  const party = `${val("adults","0")}名、子ども${val("children","0")}名`;
  return `あなたは東京ディズニーリゾートに詳しい、実用的で親身なパーク計画コンシェルジュです。以下の条件に合わせて、実行しやすく満足度の高い当日のプランを日本語で提案してください。

【来園条件】
・パーク：${park}
・来園日：${date}
・入園時間：${val("arrival")}
・退園時間：${val("leave")}${leaveTime}
・人数：${party}
・子どもの年齢：${val("ages","未指定")}
・同行者について：${companions}

【希望】
・楽しみたいこと：${interests.length ? interests.join("、") : "バランスよく楽しみたい"}
・絶対に体験したいこと：${mustDo}
・避けたいこと・苦手なこと：${avoid}
・当日のペース：${val("pace")}
・DPAの利用方針：${val("dpa")}
・費用について：${val("budget")}
・食事：${val("meal")}
・その他：${notes}

【必ず守ってほしいこと】
1. 来園日が指定されている場合は、回答時点で確認できる最新情報をWeb検索し、東京ディズニーリゾート公式サイト・公式アプリの情報を優先してください。
2. 営業時間、休止施設、ショー・パレードの開催、エントリー受付、スタンバイパス、DPAの対象施設・価格・販売状況・利用条件など、変わりやすい情報は古い情報で断定しないでください。確認できない場合は「要確認」と明記してください。
3. 公式情報で確認できない運営内容や待ち時間を作り上げないでください。待ち時間は予測と実績を区別してください。
4. 子どもの年齢、身長制限、同行者の体力、移動距離、休憩・トイレの時間を考慮してください。詰め込みすぎない現実的な計画にしてください。
5. DPAは購入をあおらず、希望予算と優先順位に沿って、購入候補・購入するなら優先したい順番・購入しない場合の代替案を説明してください。販売状況や購入可能性を保証しないでください。
6. エリア間の移動を考慮し、行ったり来たりが少ない順路にしてください。時間指定のショーや予約がある場合は、それを軸に組み立ててください。
7. 料金・予約・利用条件は公式情報を優先し、情報を確認した日付を記載してください。

【回答してほしい内容】
① 今回の条件に合った楽しみ方の方針と、最初に押さえるべきポイント
② 朝から退園までの時間帯別スケジュール（移動・待ち時間・食事・休憩も考慮）
③ 優先して体験したい施設・ショーなどの順番と、その理由
④ DPAを利用する場合の候補と優先順位、利用しない場合の代替案
⑤ 食事・休憩のおすすめタイミングと選び方
⑥ 混雑・雨・対象施設の休止など、当日の状況が違った場合の代替プラン
⑦ 来園前に確認・準備しておくこと
⑧ 公式情報の参照先リンクと、確認できなかった事項

条件が足りない場合は、勝手に決めつけず、必要な前提を明示したうえで提案してください。最初に結論を簡潔に示し、その後に具体的なスケジュールを表形式でまとめてください。`;
}
$("generate").addEventListener("click", () => {
  $("prompt").value = makePrompt();
  $("result-area").classList.remove("hidden");
  $("result-area").scrollIntoView({behavior:"smooth", block:"start"});
});
$("copy").addEventListener("click", async () => {
  const text = $("prompt").value;
  try {
    await navigator.clipboard.writeText(text);
    showToast("相談文をコピーしました。AIに貼り付けてください。");
  } catch {
    $("prompt").focus(); $("prompt").select();
    const ok = document.execCommand("copy");
    showToast(ok ? "相談文をコピーしました。" : "文章を選択しました。長押ししてコピーしてください。");
  }
});
$("share").addEventListener("click", async () => {
  const text = $("prompt").value;
  if (navigator.share) {
    try { await navigator.share({title:"ディズニー攻略の相談", text}); }
    catch (e) { if (e.name !== "AbortError") showToast("共有できませんでした。コピーをご利用ください。"); }
  } else {
    try { await navigator.clipboard.writeText(text); showToast("共有機能がないため、文章をコピーしました。"); }
    catch { showToast("コピー機能をご利用ください。"); }
  }
});
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
