const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const express = require("express");
require('dotenv').config();
const axios = require('axios');


var fs = require('fs');
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

const test = async(age) => {
  var random = Math.floor(Math.random() * 34) + 1;
  var requestUrl = "https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20220601?applicationId=" + process.env.RAKUTEN_APP_ID +
    "&age=" + age + "&sex=1&carrier=0&page=" + random;
  console.log(requestUrl);
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  await axios.get(requestUrl, {

  }).then(async (response) => {
    if (response.status !== 201) {

      for (var i = 0; i < response.data.Items.length; i++) {
        var itemCode = response.data.Items[i].Item.itemCode;
        var itemName = response.data.Items[i].Item.itemName;
        var catchcopy = response.data.Items[i].Item.catchcopy;
        var description = response.data.Items[i].Item.itemCaption;
        console.log((i + 1).toString() + "件目スタート");
        console.log(itemCode);
        console.log(description);
        try {
          await post(itemCode, description, itemName, catchcopy, browser);
        } catch (error) {
          console.log(error + " 失敗");
        }

        console.log("完了");
      }

    }
  }).catch((error) => {
    console.log(error);
    // for (const page of await browser.pages()) {
    //   await page.close();
    // }
    // await browser.close();

    return;
  });

  // for (const page of await browser.pages()) {
  //   await page.close();
  // }
  // await browser.close();

}



async function post(itemCode, description, itemName, catchcopy, browser) {
  try {

  
    const page = await browser.newPage();
    //const page = await browser.newPage("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36");
    // await page.setUserAgent(
    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    // );
    //await page.setUserAgent()
    // await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36")

    const url = `https://room.rakuten.co.jp/mix?itemcode=${itemCode}&scid=we_room_upc60`;
    console.log("ああああ");
    console.log(url);

    // await page.goto(url, {waitUntil: 'networkidle0'});
    await page.setDefaultNavigationTimeout(30000);
    //await page.waitForTimeout(1000)
    await page.goto(url);
    const userId = process.env.RAKUTEN_USER_ID
    const password = process.env.RAKUTEN_PASSWORD;
    console.log("いいいい");
    // await delay(4000);
    // ログイン処理
    const xpathId = "xpath=/html/body/div[2]/div/div/div[1]/div/form/div/table/tbody/tr[1]/td[2]/input";
    const xpathPassword = "xpath=/html/body/div[2]/div/div/div[1]/div/form/div/table/tbody/tr[2]/td[2]/input"
    await page.waitForSelector(xpathId, {
      visible: true
    });
    await page.focus(xpathId, );
    await page.type(xpathId, userId);
    await page.waitForSelector(xpathPassword, {
      visible: true
    });
    await page.focus(xpathPassword);
    await page.type(xpathPassword, password);
    await page.click('xpath=/html/body/div[2]/div/div/div[1]/div/form/div/p[1]/input');
    console.log("うううう");
    // ログイン後のページ遷移を待つ

    try {
      await page.waitForSelector("#collect-content", {
        //timeout: 5000,
        visible: true,
      });
      console.log("ええええ");
    } catch (error) {
      console.log(error)
      // for (const page of await browser.pages()) {
      //   await page.close();
      // }
      // await browser.close();
      return;
    }


    // コレ！済みの場合は、処理を終了
    let modalElement = null;
    try {
      await page.waitForSelector(".modal-dialog-container", {
        visible: true,
        //timeout: 500,
      });
      modalElement = await page.$(".modal-dialog-container");
      console.log("おおおお");
    } catch (error) {}
    if (modalElement) {
      console.log("「すでにコレしている商品です」のため処理を終了");
      // for (const page of await browser.pages()) {
      //   await page.close();
      // }
      // await browser.close();
      return;
    }
    console.log("かかかか");
    var descriptionCut = itemName + catchcopy + description.substring(0, 200) + " #あったら便利 #欲しいものリスト #ランキング #人気 #楽天市場";
    console.log(descriptionCut);

    try {
      //　投稿処理
      await page.waitForSelector("#collect-content", {
        //timeout: 30000,
        visible: true,
      });
      await page.click("#collect-content");
      await page.type("#collect-content", descriptionCut, {
        delay: 100
      });

      await page.waitForSelector("button", {
        visible: true
      });
      console.log("きききき");
      await page.click('xpath=//*[@id="scroller"]/div[4]/div[6]/div[1]/button', {
        visible: true,
      });
    } catch (error) {
      console.log(error)
      // for (const page of await browser.pages()) {
      //   await page.close();
      // }
      // await browser.close();
      return;
    }

    // for (const page of await browser.pages()) {
    //   await page.close();
    // }
    // await browser.close();
  } catch (error) {
    console.log(error);
    // for (const page of await browser.pages()) {
    //   await page.close();
    // }
    // await browser.close();
    return;
  // } finally{
  //   for (const page of await browser.pages()) {
  //     await page.close();
  //   }
  //   await browser.close();
  }


}


const app = express();

app.get("/", async(req, res) => {
  try {
    var args = [
      20,
      30,
      40
    ]
    var ageNo = args[Math.floor(Math.random() * args.length)];


    await test(ageNo);
    console.log("ログ定期実行")

  } catch (err) {
    console.log(err);
  }
  res.send('get');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT);