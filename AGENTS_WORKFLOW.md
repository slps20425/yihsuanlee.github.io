Step 1: Dev 階段 (Claude)
任務：根據 Implementation Plan 改 Code。

完成定義：當代碼寫完且 npx run build 通過後，Claude 必須在 AGENTS_WORKFLOW.md 寫下：

STATUS: READY_FOR_QA DEPLOY_URL: [你的 Firebase Hosting 網址] SCOPE: 修改了 Retry Mechanism UI

Step 2: QA 階段 (Gemini)
觸發條件：當 Gemini 看到 STATUS: READY_FOR_QA。

執行動作：

使用 Browser 預覽 功能打開 DEPLOY_URL。

對照截圖左側的 Implementation Plan（例如：檢查是否有 "Re-try 1 time" 勾選框）。

執行負面測試（如你提到的 Mouthpiece 服務連線失敗測試）。

Step 3: 回報與修復 (Feedback Loop)
若有 Bug：Gemini 在 AGENTS_WORKFLOW.md 更新：

STATUS: BUG_FOUND ISSUE: [描述視覺或邏輯錯誤] EVIDENCE: [上傳截圖或 Log]

修復：Claude 看到 BUG_FOUND 後自動接手修正，完成後回到 Step 1。