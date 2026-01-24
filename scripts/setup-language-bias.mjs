#!/usr/bin/env node
/**
 * Setup language_location_bias in Firestore using gcloud + REST API
 * Run: npx -y -p @google-cloud/firestore-bundle node scripts/setup-language-bias.mjs
 */

import { execSync } from 'child_process';

const projectId = 'wisecat-8df8d';

async function setupLanguageBias() {
    try {
        console.log('🚀 Setting up language_location_bias using gcloud...\\n');

        // Get access token from gcloud
        const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();

        const languageData = {
            languages: {
                en: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'English - Global'
                },
                zh: {
                    latitude: 25.0330,
                    longitude: 121.5654,
                    radius: 100000,
                    name: 'Chinese - Taiwan'
                },
                jp: {
                    latitude: 35.6762,
                    longitude: 139.6503,
                    radius: 100000,
                    name: 'Japanese - Tokyo'
                },
                kr: {
                    latitude: 37.5665,
                    longitude: 126.9780,
                    radius: 100000,
                    name: 'Korean - Seoul'
                },
                es: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'Spanish - Global'
                },
                fr: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'French - Global'
                },
                it: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'Italian - Global'
                }
            },
            active: true,
            lastUpdated: new Date().toISOString(),
            note: 'Language-to-location bias mapping for Google Places search. Non-ASCII languages (zh, jp, kr) use regional bias. ASCII languages (en, es, fr, it) use global search.'
        };

        // Format for Firestore REST API
        const firestoreData = {
            fields: {
                languages: {
                    mapValue: {
                        fields: {
                            en: {
                                mapValue: {
                                    fields: {
                                        latitude: { nullValue: 'NULL_VALUE' },
                                        longitude: { nullValue: 'NULL_VALUE' },
                                        radius: { nullValue: 'NULL_VALUE' },
                                        name: { stringValue: 'English - Global' }
                                    }
                                }
                            },
                            zh: {
                                mapValue: {
                                    fields: {
                                        latitude: { doubleValue: 25.0330 },
                                        longitude: { doubleValue: 121.5654 },
                                        radius: { integerValue: '100000' },
                                        name: { stringValue: 'Chinese - Taiwan' }
                                    }
                                }
                            },
                            jp: {
                                mapValue: {
                                    fields: {
                                        latitude: { doubleValue: 35.6762 },
                                        longitude: { doubleValue: 139.6503 },
                                        radius: { integerValue: '100000' },
                                        name: { stringValue: 'Japanese - Tokyo' }
                                    }
                                }
                            },
                            kr: {
                                mapValue: {
                                    fields: {
                                        latitude: { doubleValue: 37.5665 },
                                        longitude: { doubleValue: 126.9780 },
                                        radius: { integerValue: '100000' },
                                        name: { stringValue: 'Korean - Seoul' }
                                    }
                                }
                            },
                            es: {
                                mapValue: {
                                    fields: {
                                        latitude: { nullValue: 'NULL_VALUE' },
                                        longitude: { nullValue: 'NULL_VALUE' },
                                        radius: { nullValue: 'NULL_VALUE' },
                                        name: { stringValue: 'Spanish - Global' }
                                    }
                                }
                            },
                            fr: {
                                mapValue: {
                                    fields: {
                                        latitude: { nullValue: 'NULL_VALUE' },
                                        longitude: { nullValue: 'NULL_VALUE' },
                                        radius: { nullValue: 'NULL_VALUE' },
                                        name: { stringValue: 'French - Global' }
                                    }
                                }
                            },
                            it: {
                                mapValue: {
                                    fields: {
                                        latitude: { nullValue: 'NULL_VALUE' },
                                        longitude: { nullValue: 'NULL_VALUE' },
                                        radius: { nullValue: 'NULL_VALUE' },
                                        name: { stringValue: 'Italian - Global' }
                                    }
                                }
                            }
                        }
                    }
                },
                active: { booleanValue: true },
                lastUpdated: { timestampValue: languageData.lastUpdated },
                note: { stringValue: 'Language-to-location bias mapping for Google Places search. Non-ASCII (zh, jp, kr) use regional bias. ASCII (en, es, fr, it) use global search.' }
            }
        };

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/reservation/documents/configuration/language_location_bias`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(firestoreData)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error:', error);
            process.exit(1);
        }

        console.log('✅ Successfully created settings/language_location_bias');
        console.log('\\nDocument contents:');
        console.log('├── languages:');
        console.log('│   ├── en: English (Global - no regional bias)');
        console.log('│   ├── zh: Chinese (Taiwan) - Taipei region');
        console.log('│   ├── jp: Japanese (Tokyo) - Tokyo region');
        console.log('│   ├── kr: Korean (Seoul) - Seoul region');
        console.log('│   ├── es: Spanish (Global - no regional bias)');
        console.log('│   ├── fr: French (Global - no regional bias)');
        console.log('│   └── it: Italian (Global - no regional bias)');
        console.log('├── active: true');
        console.log('└── lastUpdated:', languageData.lastUpdated);

        console.log('\\n✨ Setup complete! Language location bias is now active.');
        console.log('To update it, go to Firebase Console > Firestore > settings > language_location_bias\\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupLanguageBias();
