Feature: ShotVision Video Processing Flow

  Background:
    Given I navigate to the ShotVision login page

  @upload
  Scenario: User uploads a video and waits for inference
    Given I sign in as a valid user
    When I upload the video "test-swing.mp4"
    And I wait 120 seconds for the inference to process
    Then I should see the "Score" on the dashboard

  @manage
  Scenario: User verifies and deletes an existing video
    Given I sign in as a user with existing videos
    When I click on the first video in the catalog
    Then I should see the "Score" displayed
    When I click the delete button
    Then the video should be removed from the catalog