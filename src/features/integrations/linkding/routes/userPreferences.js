import { Router } from 'express';

/**
 * Routes for retrieving user preferences
 * @returns {Router}
 */
function createUserRouters() {
  const router = Router();

  /*
   * Preferences and Settings
   */
  router.get('/profile', (req, res) => {
    // Stubbed profile
    res.json({
      theme: "auto",
      bookmark_date_display: "relative",
      bookmark_link_target: "_blank",
      web_archive_integration: "enabled",
      tag_search: "lax",
      enable_sharing: true,
      enable_public_sharing: true,
      enable_favicons: false,
      display_url: false,
      permanent_notes: false,
      search_preferences: {
        sort: "title_asc",
        shared: "off",
        unread: "off"
      }
    });
  });

  return router;
}

export { createUserRouters };
